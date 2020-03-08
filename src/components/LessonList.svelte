<script>
  import { Container, Row, Col, Button } from "sveltestrap";

  // Components
  import Lesson from "Comps/Lesson.svelte";

  // Stores
  import { APP_STATE, API_URL } from "Stores/AppState.js";

  async function getLessons() {
    const response = await fetch(`${$API_URL}/lessons`);
    const data = await response.json();
    APP_STATE.setLessons(data);
  }

  async function removeLesson({ detail }) {
    const response = await fetch(`${$API_URL}/lessons/${detail}`, {
      method: "DELETE",
    });
    if (response.status == 200) {
      const lessons = $APP_STATE.lessons;
      const item = lessons.find((lesson) => lesson.id == detail);
      const indexOf = lessons.indexOf(item);
      lessons.splice(indexOf, 1);
      APP_STATE.setLessons(lessons);
    }
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
          <Lesson {lesson} {index} on:triggerLessonRemove={removeLesson} />
        {/each}
      {/if}
    </Col>
  </Row>
</Container>
