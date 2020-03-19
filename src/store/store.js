import { writable } from "svelte/store";

const state = {
  webLessons: writable([]),
};

const getWebLessons = (lessons) => {
  state.webLessons.update((old) => lessons);
};

const deleteWebLesson = (lesson) => {
  console.log(lesson.id);
  state.webLessons.update((old) => [...old.filter((l) => l.id !== lesson.id)]);
  console.log(state.webLessons);
};

export { state, getWebLessons, deleteWebLesson };
