<script>
  // Stores
  import { APP_STATE } from "Stores/AppState.js";

  // Helpers and Enums
  import { AppStateEnums } from "Scripts/enum.js";

  function updateState(state) {
    APP_STATE.setState(state);
  }
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a
    class="navbar-brand"
    href={null}
    on:click|preventDefault={() => {
      updateState(AppStateEnums.allLessons);
    }}>
    Typer Lesson Builder
  </a>

  <ul class="navbar-nav mr-auto">
    <li
      class="nav-item"
      class:active={$APP_STATE.state == AppStateEnums.allLessons}>
      <a
        class="nav-link"
        href={null}
        on:click|preventDefault={() => {
          updateState(AppStateEnums.allLessons);
        }}>
        All Lessons
      </a>
    </li>
    <li
      class="nav-item"
      class:active={$APP_STATE.state == AppStateEnums.editLesson}>
      <a
        class="nav-link"
        href={null}
        on:click|preventDefault={() => {
          updateState(AppStateEnums.editLesson);
          APP_STATE.setLessonIndex(-1);
        }}>
        Add Lesson
      </a>
    </li>
  </ul>

</nav>
