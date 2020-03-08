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
  import Lesson from "Comps/Lesson.svelte";

  // Stores
  import { APP_STATE, API_URL } from "Stores/AppState.js";

  async function getLessons() {
    const response = await fetch(`${$API_URL}/lessons`);
    const data = await response.json();
    APP_STATE.setLessons(data);
  }

  getLessons();
</script>

<Container>
  <Row>
    <Col>
      <h1>Lesson List</h1>
    </Col>
  </Row>

  <Row>
    <Col>
      {#if !$APP_STATE.lessons.length}
        <h4>Getting Lessons</h4>
      {:else}
        <p>Select a lesson.</p>
        {#each $APP_STATE.lessons as lesson, index}
          <Lesson {lesson} {index} />
        {/each}
      {/if}
    </Col>
  </Row>
</Container>
