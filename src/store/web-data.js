import axios from "axios";
import * as store from "./store";
import { parseItem, parseList } from "./http-utils";
import API from "./config";

export async function getWebLessonsAction() {
  try {
    const response = await axios.get(`${API}/webLessons`);
    const lessons = parseList(response);
    store.getWebLessons(lessons);
    return lessons;
  } catch (error) {
    return console.log(error);
  }
}

export async function deleteWebLessonAction(lesson) {
  try {
    const response = await axios.delete(`${API}/webLessons/${lesson.id}`);
    parseItem(response, 200);
    store.deleteWebLesson(lesson);
    return null;
  } catch (error) {
    console.error(error);
  }
}
