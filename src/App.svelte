<script>
  import "./styles.scss";
  import { Router, Link, Route } from "svelte-routing";
  import Lessons from "./views/lessons/Lessons.svelte";

  import { Nav, PageNotFound, Redirect } from "./components";

  export let url = "";
</script>

<div class="section columns">
  <Router {url}>
    <Nav />
    <main class="column">
      <div>
        <Route path="/">
          <Redirect path="/lessons" />
        </Route>
        <Route path="/lessons" component={Lessons} />
        <Route path="**" component={PageNotFound} />
      </div>
    </main>
  </Router>
</div>
