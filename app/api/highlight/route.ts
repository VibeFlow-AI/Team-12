// app/api/sessions/route.ts
import { NextResponse } from "next/server";

const allSessions = [
  {
    id: 1,
    instructor: "Rahul Lavan",
    location: "Colombo",
    initials: "RL",
    initialsColor: "bg-blue-500",
    subjects: ["Science", "Physics", "Biology"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    duration: "30 mins - 1 hour",
    language: "English, Tamil",
  },
  {
    id: 2,
    instructor: "Chathum Rahal",
    location: "Galle",
    initials: "CR",
    initialsColor: "bg-orange-500",
    subjects: ["Mathematics", "History", "English"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    duration: "1 hour",
    language: "English",
  },
  {
    id: 3,
    instructor: "Malsha Fernando",
    location: "Colombo",
    initials: "MI",
    initialsColor: "bg-pink-500",
    subjects: ["Chemistry", "Art", "Commerce"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    duration: "1 hour",
    language: "Sinhala",
  },
  {
    id: 4,
    instructor: "Anuki Karunaratne",
    location: "Kandy",
    initials: "AK",
    initialsColor: "bg-green-500",
    subjects: ["Geography", "History"],
    description: "Experienced mentor in geography and history.",
    duration: "45 mins",
    language: "English, Sinhala",
  },
  {
    id: 5,
    instructor: "Tharindu Malsha",
    location: "Colombo",
    initials: "TM",
    initialsColor: "bg-indigo-500",
    subjects: ["Music"],
    description: "Passionate about teaching music theory and practice.",
    duration: "1 hour",
    language: "Sinhala",
  },
  {
    id: 6,
    instructor: "Nimasha Hansani",
    location: "Galle",
    initials: "NH",
    initialsColor: "bg-yellow-500",
    subjects: ["ICT"],
    description: "ICT expert focusing on programming and networking.",
    duration: "1 hour",
    language: "English",
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : allSessions.length;

  return NextResponse.json(allSessions.slice(0, limit));
}
