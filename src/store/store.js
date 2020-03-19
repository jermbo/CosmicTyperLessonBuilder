import { writable } from "svelte/store";

const state = {
  webLessons: writable([]),
  typingLessons: writable([]),
};

// Web Lessons
const getWebLessons = (lessons) => {
  state.webLessons.update((old) => lessons);
};

const deleteWebLesson = (lesson) => {
  state.webLessons.update((old) => [...old.filter((l) => l.id !== lesson.id)]);
};

const updateWebLesson = (lesson) => {
  state.webLessons.update((old) => {
    const index = old.findIndex((l) => l.id == lesson.id);
    old.splice(index, 1, lesson);
    return [...old];
  });
};

const addWebLesson = (lesson) => {
  state.webLessons.update((old) => {
    old.unshift(lesson);
    return old;
  });
};

// Typing Lessons

const getTypingLessons = (lessons) => {
  state.typingLessons.update((old) => lessons);
};

const deleteTypingLesson = (lesson) => {
  state.typingLessons.update((old) => [...old.filter((l) => l.id !== lesson.id)]);
};

const updateTypingLesson = (lesson) => {
  state.typingLessons.update((old) => {
    const index = old.findIndex((l) => l.id == lesson.id);
    old.splice(index, 1, lesson);
    return [...old];
  });
};

const addTypingLesson = (lesson) => {
  state.typingLessons.update((old) => {
    old.unshift(lesson);
    return old;
  });
};

export {
  state,
  getWebLessons,
  deleteWebLesson,
  updateWebLesson,
  addWebLesson,
  getTypingLessons,
  deleteTypingLesson,
  updateTypingLesson,
  addTypingLesson,
};
