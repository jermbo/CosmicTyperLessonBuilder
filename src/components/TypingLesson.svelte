<script>
  import { FormGroup, Input, Label } from "sveltestrap";

  export let steps;

  $: weird = steps.join("\n");

  function typingLesson({ target }) {
    const val = target.value.split("\n");
    steps = val;
  }
</script>

<FormGroup>
  <Label for="typingLesson">General Steps</Label>
  <Input
    type="textarea"
    rows="8"
    name="typingLesson"
    id="typingLesson"
    bind:value={weird}
    on:input={typingLesson} />
</FormGroup>
