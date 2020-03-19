<script>
  import "./styles.scss";
  import { Router, Link, Route } from "svelte-routing";
  import WebLessons from "./views/web/Lessons.svelte";
  import TypingLessons from "./views/typing/Lessons.svelte";

  import { Nav, PageNotFound, Redirect } from "./components";

  export let url = "";
</script>

<div class="section columns">
  <Router {url}>
    <Nav />
    <main class="column">
      <div>
        <Route path="/">
          <Redirect path="/web-lessons" />
        </Route>
        <Route path="/web-lessons" component={WebLessons} />
        <Route path="/typing-lessons" component={TypingLessons} />
        <Route path="**" component={PageNotFound} />
      </div>
    </main>
  </Router>
</div>
