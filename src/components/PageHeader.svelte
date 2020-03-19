<script>
  import { createEventDispatcher } from "svelte";

  import { Button } from "sveltestrap";

  const dispatch = createEventDispatcher();

  export let title = "";

  function triggerAdd() {
    dispatch("newLesson");
  }

  function triggerFilter({ detail: filter }) {
    dispatch("filteredLessons", filter);
  }
</script>

<div class="my-4 d-flex justify-content-between">
  <h3>{title}</h3>
  <div class="actions d-flex">
    <Button
      class="ml-4"
      outline
      color="success"
      size="sm"
      on:click={triggerAdd}>
      Add New Lesson
    </Button>
  </div>
</div>
