import {writable , readable } from "svelte/store";
import { AppStateEnums } from "Scripts/enum";

const defaultState = { state: AppStateEnums.allLessons, lessons: [], lessonIndex: 0, filteredLessons: [] };

function CreateAppState() {
  const { subscribe, update } = writable(defaultState);

  function setState(detail) {
    update((obj) => {
      obj.state = detail;
      return obj;
    });
  }

  function setLessons(lessons) {
    update((obj) => {
      obj.lessons = lessons;
      return obj;
    });
  }

  function setFilteredLessons(lessons) {
    update((obj) => {
      obj.filteredLessons = lessons;
      return obj;
    });
  }

  function setLessonIndex(lessons) {
    update((obj) => {
      obj.lessonIndex = lessons;
      return obj;
    });
  }

  return {
    subscribe,
    setState,
    setLessons,
    setFilteredLessons,
    setLessonIndex
  };
}

export const APP_STATE = CreateAppState();

// export const API_URL = readable("https://sampleapis.com/typer/api");
export const API_URL = readable("http://localhost:5001/typer/api");
