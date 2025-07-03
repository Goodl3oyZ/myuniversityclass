import React, { useState, useEffect, useMemo } from "react";
import { schedule } from "../data/schedule";

// Hook สำหรับเช็คขนาดหน้าจอ
function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return { width: size[0], height: size[1] };
}

// สร้าง Time Slots จากข้อมูล
function getAllTimeSlots(scheduleData) {
  const set = new Set();
  scheduleData.forEach((d) =>
    d.classes.forEach((c) => {
      set.add(c.start);
      set.add(c.end);
    })
  );
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

// สร้าง Map ของสีสำหรับแต่ละวิชา (เพื่อให้สีคงที่)
function createColorMap(scheduleData) {
  const map = new Map();
  const colors = [
    "bg-red-600", // 🔴 แดงเข้ม
    "bg-blue-600", // 🔵 น้ำเงินเข้ม
    "bg-green-600", // 🟢 เขียวเข้ม
    "bg-yellow-500", // 🟡 เหลืองสด (สว่าง)
    "bg-purple-700", // 🟣 ม่วงเข้ม
    "bg-pink-500", // 🌸 ชมพูสด
    "bg-orange-500", // 🟠 ส้มสด
  ];

  let colorIndex = 0;
  scheduleData.forEach((day) => {
    day.classes.forEach((classItem) => {
      if (!map.has(classItem.title)) {
        map.set(classItem.title, colors[colorIndex % colors.length]);
        colorIndex++;
      }
    });
  });
  return map;
}

const dayColors = {
  Mon: "text-amber-500",
  Tue: "text-rose-500",
  Wed: "text-emerald-500",
  Thu: "text-orange-500",
  Fri: "text-sky-500",
  Sat: "text-purple-500",
  Sun: "text-red-500",
};

// --- Sub-components for Desktop and Mobile ---

const MobileView = ({ scheduleData, colorMap }) => (
  <div className="p-2 sm:p-4 space-y-4">
    {scheduleData
      .filter((d) => d.classes.length > 0)
      .map((day) => (
        <div key={day.day}>
          <h2
            className={`text-xl font-bold mb-2 pl-2 ${
              dayColors[day.day] || "text-gray-800 dark:text-white"
            }`}
          >
            {day.day}
          </h2>
          <div className="space-y-3">
            {day.classes.map((cls, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-md text-white flex flex-col gap-1 ${colorMap.get(
                  cls.title
                )}`}
              >
                <span className="font-bold text-lg leading-tight">
                  {cls.title}
                </span>
                <span className="text-sm opacity-90">
                  {cls.code} (Sec: {cls.section})
                </span>
                <span className="text-sm opacity-90">
                  ⏰ {cls.start} - {cls.end}
                </span>
                <span className="text-sm opacity-90">📍 ห้อง: {cls.room}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
  </div>
);

const DesktopView = ({ scheduleData, colorMap }) => {
  const hours = getAllTimeSlots(scheduleData);
  const getHourIndex = (time) => hours.findIndex((h) => h === time);
  const getColSpan = (start, end) => {
    const startIdx = getHourIndex(start);
    const endIdx = getHourIndex(end);
    return startIdx === -1 || endIdx === -1 ? 1 : endIdx - startIdx;
  };

  return (
    <div className="overflow-x-auto p-2">
      <table className="table-fixed border-separate border-spacing-1 w-full min-w-[1000px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2 text-base font-bold">
              วัน \ เวลา
            </th>
            {hours.slice(0, -1).map((h) => (
              <th
                key={h}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-2 text-sm font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scheduleData.map(({ day, classes }) => {
            const cells = [];
            let hourIdx = 0;
            while (hourIdx < hours.length - 1) {
              const cls = classes.find(
                (c) => getHourIndex(c.start) === hourIdx
              );
              if (cls) {
                const colSpan = getColSpan(cls.start, cls.end);
                cells.push({ type: "class", colSpan, cls });
                hourIdx += colSpan;
              } else {
                cells.push({ type: "empty" });
                hourIdx++;
              }
            }
            return (
              <tr key={day} className="h-16">
                {" "}
                {/* ใช้ h-16 ตามที่คุณต้องการ */}
                <td
                  className={`sticky left-0 z-10 bg-gray-100 dark:bg-gray-800 px-3 py-2 font-bold text-base align-middle text-center ${
                    dayColors[day] || "text-gray-800 dark:text-white"
                  }`}
                >
                  {day}
                </td>
                {cells.map((cell, i) =>
                  cell.type === "class" ? (
                    <td
                      key={i}
                      colSpan={cell.colSpan}
                      className="border border-gray-200 dark:border-gray-700 p-1 align-top"
                    >
                      {/* --- นี่คือส่วนที่แก้ไข Layout ทั้งหมด --- */}
                      <div
                        className={`h-full flex flex-col justify-center p-1.5 rounded-lg text-white ${colorMap.get(
                          cell.cls.title
                        )}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-xs leading-tight break-words">
                            {cell.cls.title}
                          </p>
                          <p className="text-[10px] opacity-80 flex-shrink-0">
                            {cell.cls.start} - {cell.cls.end}
                          </p>
                        </div>
                        <div className="mt-1 text-[10px] opacity-80 flex justify-between">
                          <span>
                            {cell.cls.code} ({cell.cls.section})
                          </span>
                          <span>📍 {cell.cls.room}</span>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <td
                      key={i}
                      className="border border-gray-200 dark:border-gray-700"
                    ></td>
                  )
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Component ---

export default function Timetable({ isLoading }) {
  const { width } = useWindowSize();
  const isMobile = width < 1024; // Breakpoint at 1024px for lg

  const colorMap = useMemo(() => createColorMap(schedule), []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl shadow-lg bg-gray-50 dark:bg-gray-900 animate-fade-in ">
      {isMobile ? (
        <MobileView scheduleData={schedule} colorMap={colorMap} />
      ) : (
        <DesktopView scheduleData={schedule} colorMap={colorMap} />
      )}
    </div>
  );
}
