import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';
import colors from '../../../js/colors.js';

import './chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      messages: [],
      players: {},
    };

    this.msgIds = 0;

    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleSend = this.handleSend.bind(this);

    this.shouldScroll = false;
  }

  componentDidMount() {
    const { messages, players } = this.state;

    this.chatSubscription = wsMgr.subscribe("chat", msg => {

      this.shouldScroll = true;

      switch (msg.request) {
        case "initialPlayers":
        for (let id in msg.data) {
          players[id] = msg.data[id];
        }
        this.setState({ players });
        break;

        case "message":
        messages.push(
          <div key={this.msgIds++}>
            <span style={{color: colors.getColor(msg.data.id)}}>{msg.data.username + ": "}</span>
            <span>{msg.data.text}</span>
          </div>
        );
        this.setState({ messages });
        break;

        case "arrived":
        messages.push(
          <div key={this.msgIds++}>
            <span style={{color: colors.getColor(msg.data.id)}}>{msg.data.username}</span>
            <span style={{color: "#a0a0a0"}}>{" entered the chat"}</span>
          </div>
        );
        players[msg.data.id] = msg.data;
        this.setState({ messages, players });
        break;

        case "left":
        messages.push(
          <div key={this.msgIds++}>
            <span style={{color: colors.getColor(msg.data.id)}}>{msg.data.username}</span>
            <span style={{color: "#a0a0a0"}}>{" left the chat"}</span>
          </div>
        );
        delete players[msg.data.id];
        this.setState({ messages, players });
        break;

        default: break;
      }
    });

    wsMgr.sendData({
      request: "startSendChat",
    });
  }

  componentDidUpdate() {
    if (this.shouldScroll) this.messageDummy.parentNode.scrollTop = this.messageDummy.parentNode.scrollHeight;
    this.shouldScroll = false;
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("chat", this.chatSubscription);
  }

  handleChangeText(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ text: e.target.value.substring(0, 200) });
  }

  handleSend(e) {
    const { text } = this.state;

    e.preventDefault();

    if (text.length === 0) return;

    wsMgr.sendData({
      request: "chat",
      data: {
        text
      }
    });

    this.setState({ text: "" });
  }

  render() {
    const { messages, text, players } = this.state;

    const playersComp = [];
    for (let id in players) {
      playersComp.push(
        <div key={id} style={{color: colors.getColor(id)}} className="chat-player">{players[id].username}</div>
      );
    }

    return (
      <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
        <div className="chat-title">Global chat</div>
        <div style={{flexGrow: "1", flexShrink: "1", height: "100%", overflowY: "auto"}}>
          <div className="chat-titleContainer">
            <div className="chat-playersContainer">
              <div className="chat-subTitle">Connected players:</div>
              {playersComp}
            </div>
          </div>
          <div className="chat-messagesContainer">
            <div className="chat-messagesSubContainer">
              <div style={{overflowWrap: "break-word"}} className="chat-messages">{messages}</div>
              <div ref={el => this.messageDummy = el}></div>
            </div>
          </div>
        </div>
        <div>
          <form onSubmit={this.handleSend} style={{margin: "0px 0px 0px 5px"}}>
            <div style={{display: "flex", flexDirection: "row"}}>
              <div style={{flexGrow: "1"}}>
                <input type="text" value={text} className="chat-messageInput" placeholder="Global chat..." onChange={this.handleChangeText}></input>
              </div>
              <div>
                <button type="submit" className="chat-sendButton">Send</button>
              </div>
            </div>
          </form>
        </div>
        <div style={{textAlign: "center", padding: "20px 10px 10px 10px"}}>
          <div>
            <img src="/img/completeLogo.png" alt="" style={{width: "100%", maxWidth: "450px"}}></img>
          </div>
          <div style={{fontFamily: "Montserrat, sans-serif", fontWeight: "bold", color: "white", fontSize: "20px"}}>Nicolas Maier 2018</div>
        </div>
      </div>
    );
  }
}

export default Chat;
