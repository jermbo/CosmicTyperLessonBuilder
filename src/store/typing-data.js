import axios from "axios";
import * as store from "./store";
import { parseItem, parseList } from "./http-utils";
import API from "./config";

export async function getTypingLessonsAction() {
  try {
    const response = await axios.get(`${API}/typingLessons`);
    const lessons = parseList(response);
    store.getTypingLessons(lessons);
    return lessons;
  } catch (error) {
    return console.log(error);
  }
}

export async function deleteTypingLessonAction(lesson) {
  try {
    const response = await axios.delete(`${API}/typingLessons/${lesson.id}`);
    parseItem(response, 200);
    store.deleteTypingLesson(lesson);
    return null;
  } catch (error) {
    console.error(error);
  }
}

export async function updateTypingLessonAction(lesson) {
  try {
    const response = await axios.put(`${API}/typingLessons/${lesson.id}`, lesson);
    const updatedLesson = parseItem(response, 200);
    store.updateTypingLesson(updatedLesson);
    return updatedLesson;
  } catch (error) {
    console.error(error);
  }
}
export async function addTypingLessonAction(lesson) {
  try {
    const response = await axios.post(`${API}/typingLessons/`, lesson);
    const addedLesson = parseItem(response, 201);
    store.addTypingLesson(addedLesson);
    return addedLesson;
  } catch (error) {
    console.error(error);
  }
}
