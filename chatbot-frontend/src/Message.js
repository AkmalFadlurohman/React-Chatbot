import React from 'react';

class Message extends React.Component {
	constructor(props) {
        super(props);
        this.sendSelected = this.sendSelected.bind(this);
    }

	sendSelected(e) {
		var selectedVal = e.target.value;
		this.props.onClick(selectedVal);
	}
	
    render() {
    	var user = this.props.user;
        var message = this.props.message;
        if (message.type === 'text') {
        	var content = message.content;
	        return (
	        	<li className={`chat ${user === message.user ? "right" : "left"}`}>
			        <p>{content}</p>
			    </li>
	        );
        } else if (message.type === 'template') {
        	var items = message.items;
        	return (
	        	<li className={`chat ${user === message.user ? "right" : "left"}`}>
		        	{
                        items.map((element) => 
                    		<button className="button" value={element.text} onClick={this.sendSelected}>{element.text}</button>
                        )
    					
                    }
			    </li>
	        );
        }

    }
}

export default Message;