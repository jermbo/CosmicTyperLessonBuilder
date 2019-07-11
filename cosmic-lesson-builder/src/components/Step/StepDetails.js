import React, { Component } from "react";
import Task from "../Task/Task";

class StepDetails extends Component {
  constructor(props) {
    super();

    console.log(props);
    this.state = {
      step: props.step
    };
  }

  addTask = () => {
    this.state.step.tasks.push({
      item: "",
      value: ""
    });
    this.setState({
      step: this.state.step
    });
  };

  valueChange = event => {
    const key = event.target.getAttribute("data-key");
    this.state.step[key] = event.target.value;
    this.setState({
      step: this.state.step
    });
  };

  render() {
    const step = this.state.step;
    let tasks = step.tasks.map((task, index) => {
      return <Task key={index} />;
    });

    return (
      <div className="edit-step">
        <h1>Edit Step</h1>
        <label>
          Step Name
          <input value={step.name} data-key="name" onChange={this.valueChange} />
        </label>
        <label>
          Step Description
          <textarea value={step.description} data-key="description" onChange={this.valueChange} />
        </label>
        <label>
          Step Example
          <input value={step.example} data-key="example" onChange={this.valueChange} />
        </label>
        {tasks}
        <button onClick={this.addTask}>Add Task</button>
      </div>
    );
  }
}

export default StepDetails;
