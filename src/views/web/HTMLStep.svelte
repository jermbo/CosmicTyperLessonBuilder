<script>
  import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Collapse,
    Button,
    FormGroup,
    Input,
    Label,
  } from "sveltestrap";

  // Life Cycle
  import { createEventDispatcher } from "svelte";

  export let step = {};
  export let index = 0;

  // Local Variables
  const dispatch = createEventDispatcher();

  const LESSON_TYPES = ["dom", "style"];

  $: weird = step.action.join("\n");

  let isOpen = false;

  function updateType(e) {
    e.target.value = step.type;
  }

  function codeLesson(e) {
    const target = e.target;
    const val = target.value.split("\n");
    const index = +target.dataset.index;
    step.action = val;
  }

  function removeStep(index) {
    dispatch("triggerRemove", index);
  }
</script>

<Card class="mb-2">
  <CardHeader class="d-flex justify-content-between">
    <CardTitle class="mb-0">Step {index + 1}</CardTitle>
    <div class="card-actions">
      <button
        on:click={() => (isOpen = !isOpen)}
        class="btn btn-outline-secondary btn-sm">
        {isOpen ? 'Close' : 'Open'}
      </button>
      <button on:click={() => removeStep(index)} class="btn btn-danger btn-sm">
        Remove Step {index + 1}
      </button>
    </div>
  </CardHeader>
  <Collapse {isOpen}>
    <CardBody>

      <FormGroup>
        <Label for="type">Type</Label>
        <select
          name="type"
          id="type"
          class="form-control"
          bind:value={step.type}>
          <option value="">Select a type</option>
          {#each LESSON_TYPES as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </FormGroup>

      <FormGroup>
        <Label for="stepDescription">Lesson Description</Label>
        <Input
          name="stepDescription"
          id="stepDescription"
          bind:value={step.desc} />
      </FormGroup>

      <FormGroup>
        <Label for="htmlStep">Html Step</Label>
        <Input
          type="textarea"
          rows="8"
          name="htmlStep"
          id="htmlStep"
          bind:value={weird}
          on:input={codeLesson} />
      </FormGroup>

    </CardBody>
  </Collapse>
</Card>
