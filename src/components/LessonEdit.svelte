<script>
  import {
    Container,
    Row,
    Col,
    Button,
    Form,
    FormGroup,
    Input,
    Label,
  } from "sveltestrap";

  // Components
  import TypingLesson from "./TypingLesson.svelte";
  import HTMLLesson from "./HTMLLesson.svelte";

  // Stores
  import { APP_STATE, API_URL } from "Stores/AppState.js";
  // Helpers and Enums
  import { AppStateEnums } from "Scripts/enum.js";

  const CATEGORY_TYPES = ["html-css", "general"];
  const DIFFICULTY_TYPES = ["easy", "medium", "hard"];

  const sampleLesson = {
    title: "",
    category: "",
    difficulty: "",
    hasCompleted: false,
    steps: [],
  };

  $: lesson = $APP_STATE.lessons[$APP_STATE.lessonIndex] || sampleLesson;

  function clearLessons() {
    lesson.steps = [];
  }

  function addStep() {
    const newStep = {
      type: "",
      desc: "",
      action: [],
      render: true,
    };
    lesson.steps = [...lesson.steps, newStep];
  }

  function removeStep(index) {
    const remove = lesson.steps.splice(index, 1);
    lesson.steps = lesson.steps;
  }

  function saveLesson() {
    fetch(`${$API_URL}/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lesson),
    })
      .then((resp) => resp.json())
      .then((data) => {
        APP_STATE.setState(AppStateEnums.allLessons);
        APP_STATE.setLessonIndex(-1);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function updateLesson() {
    const id = $APP_STATE.lessons[$APP_STATE.lessonIndex].id;
    fetch(`${$API_URL}/lessons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lesson),
    })
      .then((resp) => resp.json())
      .then((data) => {
        APP_STATE.setState(AppStateEnums.allLessons);
        APP_STATE.setLessonIndex(-1);
      })
      .catch((err) => {
        console.log(err);
      });
  }
</script>

<Container>
  <Row>
    <Col>
      <header>
        <h1 class="">Lesson Editor</h1>
        {#if $APP_STATE.lessonIndex < 0}
          <Button outline color="primary" on:click={saveLesson}>
            Save Lesson
          </Button>
        {:else}
          <Button outline color="primary" on:click={updateLesson}>
            Update Lesson
          </Button>
        {/if}
      </header>
    </Col>
  </Row>
  <Row>
    <Col md="7">
      <FormGroup>
        <Label for="title">Title</Label>
        <Input
          name="title"
          id="title"
          placeholder="with a placeholder"
          bind:value={lesson.title} />
      </FormGroup>

      <FormGroup>
        <Label for="category">Category</Label>
        <select
          name="category"
          id="category"
          class="form-control"
          bind:value={lesson.category}
          on:change={clearLessons}>
          <option value="">Select a category</option>
          {#each CATEGORY_TYPES as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </FormGroup>

      <FormGroup>
        <Label for="difficulty">Difficulty</Label>
        <select
          name="difficulty"
          id="difficulty"
          class="form-control"
          bind:value={lesson.difficulty}>
          <option value="">Select a difficulty</option>
          {#each DIFFICULTY_TYPES as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </FormGroup>

      <!-- General Section -->
      {#if lesson.category == 'general'}
        <TypingLesson bind:steps={lesson.steps} />
      {/if}

      {#if lesson.category == 'html-css'}
        <Button outline color="secondary" on:click={addStep}>
          Add New Step
        </Button>
        {#if lesson.steps.length && typeof lesson.steps[0] == 'object'}
          {#each lesson.steps as step, i}
            <HTMLLesson bind:step />
            <Button on:click={() => removeStep(i)}>Remove Step</Button>
          {/each}
        {/if}
      {/if}

    </Col>
    <Col md="5">
      <h2>JSON OutPut</h2>
      <pre>{JSON.stringify(lesson, null, 2)}</pre>
    </Col>
  </Row>
</Container>
