import React from 'react';

class TaskTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: '',
            value: ''
        }
        this.itemChange = this.itemChange.bind(this);
        this.valueChange = this.valueChange.bind(this);
    }

    itemChange(event) {
        this.setState({ item: event.target.value });
    }

    valueChange(event) {
        this.setState({ value: event.target.value });
    }


    render() {


        return (
            <div className="test-container">
                <div className="test-column">
                    <label>
                        Item
                        <input value={this.state.item} onChange={this.itemChange} />
                    </label>
                    <label>
                        Value
                        <input value={this.state.value} onChange={this.valueChange} />
                    </label>
                </div>
            </div>
        )
    }
}
export default TaskTest