import { writable } from "svelte/store";

const state = {
  webLessons: writable([]),
};

const getWebLessons = (lessons) => {
  state.webLessons.update((old) => {
    return lessons;
  });
};

const deleteWebLesson = (hero) => {
  state.heroes.update((old) => [...old.filter((h) => h.id !== hero.id)]);
};

export { state, getWebLessons, deleteWebLesson };
