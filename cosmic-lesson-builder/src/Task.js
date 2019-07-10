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
    constructor(props) {
        super(props);
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
                <label>
                    Type
                        <input value={this.state.type} />
                </label>
                <label>
                    Element
                        <input value={this.state.element} />
                </label>
                 <label>
                    Instructions 
                        <input value={this.state.instructions} />
                </label>
                
                <label>
                    Hint
                    <input value={this.state.hint} />
                </label> 
                <TaskTest/>
            </div>
        )
    }
}

export default Task