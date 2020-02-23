import {writable , readable } from "svelte/store";
import { AppStateEnums } from "Scripts/enum";

const defaultState = { state: AppStateEnums.appStart, session_start: Date.now() };

function CreateAppState() {
  const { subscribe, update } = writable(defaultState);

  function setState(detail) {
    update((obj) => {
      obj.state = detail;
      return obj;
    });
  }

  return {
    subscribe,
    setState,
  };
}

export const APP_STATE = CreateAppState();

export const API_URL = readable("https://sampleapis.com/typer/api");