<script>
  import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Container,
    Row,
    Col,
    Button,
  } from "sveltestrap";

  // Components
  import Lesson from "Comps/Lesson.svelte";

  // Stores
  import { APP_STATE, API_URL } from "Stores/AppState.js";
  import { LessonCategory } from "Scripts/enum.js";
  let isOpen = false;
  let filterOption = "";

  async function getLessons() {
    const response = await fetch(`${$API_URL}/lessons`);
    const data = await response.json();
    APP_STATE.setLessons(data);
    APP_STATE.setFilteredLessons(data);
    console.log($APP_STATE.lessons);
    console.log($APP_STATE.filteredLessons);
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

  function filterLessons(category) {
    if (!category) {
      APP_STATE.setFilteredLessons($APP_STATE.lessons);
      filterOption = "";
      return;
    }
    filterOption = category;
    const filtered = $APP_STATE.lessons.filter((lesson) => {
      return lesson.category == category;
    });
    APP_STATE.setFilteredLessons(filtered);
  }
</script>

<Container>
  <Row>
    <Col>
      <header class="my-4 d-flex justify-content-between">
        <h3>Lesson List</h3>

        <Dropdown {isOpen} toggle={() => (isOpen = !isOpen)}>
          <DropdownToggle caret>
            {filterOption ? `Filtered : ${filterOption}` : 'Filter Options'}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem
              on:click={() => {
                filterLessons();
              }}>
              Show All
            </DropdownItem>
            <DropdownItem
              on:click={() => {
                filterLessons(LessonCategory.general);
              }}>
              General Typing
            </DropdownItem>
            <DropdownItem
              on:click={() => {
                filterLessons(LessonCategory.html);
              }}>
              HTML & CSS
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </header>

    </Col>
  </Row>

  <Row>
    <Col>
      {#if !$APP_STATE.lessons.length}
        <h4>Getting Lessons</h4>
      {:else}
        <p>Select a lesson.</p>
        {#each $APP_STATE.filteredLessons as lesson, index}
          <Lesson {lesson} {index} on:triggerLessonRemove={removeLesson} />
        {/each}
      {/if}
    </Col>
  </Row>
</Container>
