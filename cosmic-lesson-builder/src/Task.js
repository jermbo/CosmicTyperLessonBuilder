import React from 'react';
import TaskTest from './Test'
/*
Task
    Type
    Element
    Instructions
    Hint
    Test
      Item
      Value
*/
class Task extends React.Component{
    constructor() {
        super();
        this.state = {
            type:'',
            element:'',
            instructions: '',
            hint:'',
            tests:[]
        }
        this.typeChange = this.typeChange.bind(this);
        this.elementChange = this.elementChange.bind(this);
        this.instructionsChange = this.instructionsChange.bind(this);
        this.hintChange = this.hintChange.bind(this);
    }

    typeChange(event) {
        
        this.setState({ type: event.target.value });
        
    }

    elementChange(event) {
        
        this.setState({ element: event.target.value });
        
    }

    instructionsChange(event) {

        this.setState({ instructions: event.target.value });
        
    }

    hintChange(event) {
        
        this.setState({ hint: event.target.value });
        
    }

    render() {
        return (
            <div className="task-container">
                <h3>Task</h3>
                <label>
                    Type
                        <input value={this.state.type} onChange={this.typeChange}/>
                </label>
                <label>
                    Element
                        <input value={this.state.element}  onChange={this.elementChange}/>
                </label>
                 <label>
                    Instructions 
                        <input value={this.state.instructions}  onChange={this.instructionsChange}/>
                </label>                
                <label>
                    Hint
                    <input value={this.state.hint}  onChange={this.hintChange}/>
                </label> 
                <TaskTest/>
            </div>
        )
    }
}

export default Task