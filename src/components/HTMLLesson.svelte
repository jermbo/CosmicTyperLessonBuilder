<script>
  import { Button, FormGroup, Input, Label } from "sveltestrap";

  export let step = {};

  const LESSON_TYPES = ["dom", "style"];

  console.log(step.action);
  $: weird = step.action.join("\n");

  function updateType(e) {
    e.target.value = step.type;
  }

  function codeLesson(e) {
    const target = e.target;
    const val = target.value.split("\n");
    const index = +target.dataset.index;
    step.action = val;
  }
</script>

<FormGroup>
  <Label for="type">Type</Label>
  <select name="type" id="type" class="form-control" bind:value={step.type}>
    <option value="">Select a type</option>
    {#each LESSON_TYPES as type}
      <option value={type}>{type}</option>
    {/each}
  </select>
</FormGroup>

<FormGroup>
  <Label for="stepDescription">Lesson Description</Label>
  <Input name="stepDescription" id="stepDescription" bind:value={step.desc} />
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
