<script>
  import { onMount } from "svelte";
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
  import LessonList from "./LessonList.svelte";
  import LessonDetail from "./LessonDetail.svelte";
  import { Modal, PageHeader } from "../../components";

  import {
    state,
    getWebLessonsAction,
    deleteWebLessonAction,
    updateWebLessonAction,
    addWebLessonAction,
  } from "../../store";

  const { webLessons } = state;

  let selected = undefined;
  let title = "Web Lessons";
  let lessonToDelete = null;
  let message = "";
  let showModal = false;

  onMount(async () => await getWebLessons());

  async function getWebLessons() {
    await getWebLessonsAction();
  }

  function enableAddModule() {
    selected = {};
  }

  function askToDelete({ detail: lesson }) {
    console.log(lesson);
    lessonToDelete = lesson;
    showModal = true;
    if (lessonToDelete.title) {
      message = `Would you like to delete ${lessonToDelete.title}?`;
    }
  }

  async function deleteLesson() {
    closeModal();
    if (lessonToDelete) {
      console.log(`You said you want to delete ${lessonToDelete.title}`);
      await deleteWebLessonAction(lessonToDelete);
    }
    clear();
  }

  function clear() {
    selected = null;
  }

  function select({ detail: lesson }) {
    selected = lesson;
    console.log(`You selected ${lesson.title}`);
  }

  function closeModal() {
    showModal = false;
  }

  async function save({ detail: lesson }) {
    let theLesson;
    if (lesson.id) {
      theLesson = await updateWebLessonAction(lesson);
    } else {
      theLesson = await addWebLessonAction(lesson);
    }
  }
</script>

<Container>
  <Row>
    <Col>
      <PageHeader {title}>
        <Button color="success" size="sm" on:click={enableAddModule}>
          Add New Lesson
        </Button>
      </PageHeader>
    </Col>
  </Row>
  {#if $webLessons}
    <Row>
      <Col>
        {#if !selected}
          <LessonList
            lessons={$webLessons}
            on:deleted={askToDelete}
            on:selected={select} />
        {:else}
          <LessonDetail lesson={selected} on:unselect={clear} on:save={save} />
        {/if}

      </Col>
    </Row>
  {/if}

  <Modal
    {message}
    isOpen={showModal}
    on:handleNo={closeModal}
    on:handleYes={deleteLesson} />
</Container>
