<script>
  // Life Cycle
  import { createEventDispatcher } from "svelte";

  // Props
  export let lesson;
  export let index;

  // Local Variables
  const dispatch = createEventDispatcher();

  // Stores
  import { APP_STATE, API_URL } from "Stores/AppState.js";
  // Helpers and Enums
  import { AppStateEnums } from "Scripts/enum.js";

  function editLesson(id) {
    APP_STATE.setState(AppStateEnums.editLesson);
    APP_STATE.setCurrentLessonId(id);
  }

  function removeLesson(id) {
    dispatch("triggerLessonRemove", id);
  }
</script>

<style lang="scss">
  .lesson {
    &:hover {
      background: #ebebeb !important;
    }
  }
</style>

<div
  class="lesson bg-light p-3 d-flex justify-content-center align-items-center
  border-bottom">
  <p class="m-0" on:click={() => editLesson(lesson.id)}>{lesson.title}</p>
  <div class="actions d-flex ml-auto">
    <button
      type="button"
      class="btn btn-primary btn-sm mr-2"
      on:click={() => editLesson(lesson.id)}>
      Edit
    </button>
    <button
      type="button"
      class="btn btn-danger btn-sm"
      on:click={() => removeLesson(lesson.id)}>
      Delete
    </button>
  </div>
</div>
