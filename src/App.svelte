<script>
  // Components
  import LessonEdit from "Comps/LessonEdit.svelte";
  import Nav from "Comps/Nav.svelte";

  // Stores
  import { APP_STATE } from "Stores/AppState.js";

  // Helpers
  import { AppStateEnums } from "Scripts/enum.js";

  $: appState = $APP_STATE.state;

  APP_STATE.setState(AppStateEnums.lesson);
</script>

<style lang="scss" global>
  @import "styles/styles.scss";
</style>

<Nav />

<main>
  {#if !appState || appState == AppStateEnums.appStart}
    <!-- content here -->
  {/if}

  {#if appState == AppStateEnums.allLessons}
    <!-- content here -->
  {/if}

  {#if appState == AppStateEnums.lesson}
    <LessonEdit />
  {/if}
</main>
