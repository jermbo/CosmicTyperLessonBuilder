import React, { Component } from "react";

class StepList extends Component {
  constructor(props) {
    super();

    this.state = {
      steps: props.steps
    };
  }

  setCurrentStep = event => {
    const currentStep = event.target.getAttribute("data-value");
    this.setState({ currentStep: currentStep });
  };

  addStep = () => {
    this.state.steps.push({
      tasks: [],
      description: "",
      example: "",
      name: this.state.steps.length
    });
    this.setState({
      steps: this.state.steps
    });
  };

  render() {
    let steps = this.state.steps.map((step, index) => {
      const isActive = index == this.state.currentStep;

      return (
        <div
          key={index}
          data-value={index}
          className={isActive ? "step active" : "step"}
          onClick={this.setCurrentStep}
        >
          {step.name}
        </div>
      );
    });

    return (
      <div className="step-legend">
        <h1>Steps</h1>
        {steps}
        <button onClick={this.addStep}>Add Step</button>
      </div>
    );
  }
}

export default StepList;
