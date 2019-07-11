import React, { Component } from "react";
import StepDetails from "./components/Step/StepDetails";
import StepList from "./components/Step/StepList";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentStep: 0,
      steps: [
        {
          tasks: [],
          description: "",
          example: "",
          name: "Test"
        }
      ]
    };
  }

  getCurrentStep = () => {
    return this.state.steps[this.state.currentStep];
  };

  render() {
    const step = this.getCurrentStep();

    return (
      <div className="app-container">
        <StepDetails step={step} />
        <StepList steps={this.state.steps} />
      </div>
    );
  }
}

export default App;
