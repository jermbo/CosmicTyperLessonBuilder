<script>
  // Components
  import LessonList from "Comps/LessonList.svelte";
  import LessonEdit from "Comps/LessonEdit.svelte";
  import Nav from "Comps/Nav.svelte";

  // Stores
  import { APP_STATE } from "Stores/AppState.js";

  // Helpers
  import { AppStateEnums } from "Scripts/enum.js";

  $: appState = $APP_STATE.state;
</script>

<style lang="scss" global>
  @import "styles/styles.scss";
</style>

<Nav />

<main>
  {#if !appState || appState == AppStateEnums.allLessons}
    <LessonList />
  {:else if appState == AppStateEnums.editLesson}
    <LessonEdit />
  {/if}
</main>
