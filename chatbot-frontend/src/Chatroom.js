import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import Message from './Message.js';
import io from "socket.io-client";

class Chatroom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: []
        };
        this.socket = io('localhost:8080');

        this.socket.on('RECEIVE_MESSAGE', function(reply){
            addMessage(reply);
        });

        const addMessage = reply => {
            var message = JSON.parse(reply);
            if (message.type === 'text') {
                this.setState({
                    messages: this.state.messages.concat([{
                        user: message.user,
                        type: message.type,
                        content: message.content,
                    }])
                });
                this.socket.emit('RECEIVE_MESSAGE', {
                    user: this.socket.id,
                    type: message.type,
                    content: message.content
                });
            } else if (message.type === 'template') {
                this.setState({
                    messages: this.state.messages.concat([{
                        user: message.user,
                        type: message.type,
                        items: message.items,
                    }])
                });
                this.socket.emit('RECEIVE_MESSAGE', {
                    user: this.socket.id,
                    type: message.type,
                    items: message.items
                });
            }
        };
        this.sendMessage = this.sendMessage.bind(this);
        this.sendSelected = this.sendSelected.bind(this);
    }

    componentDidMount() {
        this.scrollToBot();
    }

    componentDidUpdate() {
        this.scrollToBot();
    }

    scrollToBot() {
        ReactDOM.findDOMNode(this.refs.chats).scrollTop = ReactDOM.findDOMNode(this.refs.chats).scrollHeight;
    }

    sendMessage(e) {
        e.preventDefault();
        if (ReactDOM.findDOMNode(this.refs.msg).value.length <= 0) {
            return;
        }
        this.socket.emit('SEND_MESSAGE', {
            user: this.socket.id,
            type: 'text',
            content: ReactDOM.findDOMNode(this.refs.msg).value
        });
        this.setState({
            messages: this.state.messages.concat([{
                user: this.socket.id,
                type: 'text',
                content: ReactDOM.findDOMNode(this.refs.msg).value,
            }])}, () => {
                ReactDOM.findDOMNode(this.refs.msg).value = "";
            }
        );
    }

    sendSelected(selectedVal) {
        if (selectedVal.length <= 0) {
            return;
        }
        this.socket.emit('SEND_MESSAGE', {
            user: this.socket.id,
            type: 'text',
            content: selectedVal
        });
        this.setState({
            messages: this.state.messages.concat([{
                user: this.socket.id,
                type: 'text',
                content: selectedVal,
            }])
        });
    }

    render() {
        const user = this.socket.id;
        const messages = this.state.messages;

        return (
            <div className="chatroom">
                <h3>Kalimat.ai</h3>
                <ul className="chats" ref="chats">
                    {
                        messages.map((message) => 
                            <Message message={message} user={user} onClick={this.sendSelected}/>
                        )
                    }
                </ul>
                <form className="input" onSubmit={this.sendMessage}>
                    <input type="text" ref="msg" />
                    <input type="submit" value="Send" />
                </form>
            </div>
        );
    }
}

export default Chatroom;