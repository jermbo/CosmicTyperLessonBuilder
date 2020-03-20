<script>
  import { onMount, createEventDispatcher } from "svelte";

  import { Row, Col, Button, Form, FormGroup, Input, Label } from "sveltestrap";

  import HTMLStep from "./HTMLStep.svelte";

  const dispatch = createEventDispatcher();
  export let lesson = {};
  let addMode = false;
  let editingLesson = {};

  const DIFFICULTY_TYPES = ["easy", "medium", "hard"];

  onMount(() => watchLesson());

  function watchLesson() {
    if (lesson && lesson.id) {
      editingLesson = { ...lesson };
      addMode = false;
    } else {
      editingLesson = {
        title: "",
        category: "html-css",
        difficulty: "",
        hasCompleted: false,
        steps: [],
      };
      addMode = true;
    }
  }

  function saveLesson() {
    console.log(editingLesson);
    dispatch("save", editingLesson);
    clear();
  }

  function clear() {
    dispatch("unselect");
  }

  function addStep() {
    const newStep = {
      type: "",
      desc: "",
      action: [],
      render: true,
    };
    editingLesson.steps = [...editingLesson.steps, newStep];
  }

  function removeStep({ detail }) {
    const remove = editingLesson.steps.splice(detail, 1);
    editingLesson.steps = editingLesson.steps;
  }
</script>

<header class="my-4 d-flex justify-content-between">
  <h3>{editingLesson.title}</h3>
  <div>
    <Button outline color="danger" on:click={clear}>Cancel</Button>
    <Button outline color="primary" on:click={saveLesson}>Save Lesson</Button>
  </div>
</header>

<Row>
  <Col mb="8">
    <FormGroup>
      <Label for="title">Title</Label>
      <Input
        name="title"
        id="title"
        placeholder="with a placeholder"
        bind:value={editingLesson.title} />
    </FormGroup>

    <FormGroup>
      <Label for="difficulty">Difficulty</Label>
      <select
        name="difficulty"
        id="difficulty"
        class="form-control"
        bind:value={editingLesson.difficulty}>
        <option value="">Select a difficulty</option>
        {#each DIFFICULTY_TYPES as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
    </FormGroup>

    <Button class="mb-2" outline color="secondary" on:click={addStep}>
      Add New Step
    </Button>
    {#if editingLesson.steps && editingLesson.steps.length}
      {#each editingLesson.steps as step, index}
        <HTMLStep {index} bind:step on:triggerRemove={removeStep} />
      {/each}
    {/if}
  </Col>
  <Col md="5">
    <h4>JSON OutPut</h4>
    <pre style="max-height: 70vh; overflow-x: auto">
      {JSON.stringify(editingLesson, null, 2)}
    </pre>
  </Col>
</Row>
