import React from 'react';
import logo from './logo.svg';
import  Task  from './Task.js'
import './App.css';
/*
Lessons have Steps, Steps have tasks
desc, example, list of tasks
  Task
    Type
    Element
    Instructions
    Hint
    Test
      Item
      Value
*/

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      description: '',
      example: '',
      name:''
    };
  }
  nameChange() {
    
  }
  nameChange() {
    
  }
  nameChange() {
    
  }

  render() {
    return (
      <div className="app-container">
        <div className="step-legend">

        </div>
        <div className="edit-step">
          <label>
            Step Name
          <input value={this.state.name} />
          </label>
          <label>
            Step Description
            <input value={this.state.description} />
          </label>
          <label>
            Step Example
            <input value={this.state.example} />
          </label>
        <Task/>
        </div>
      </div>
    );
  }
}

export default App;
