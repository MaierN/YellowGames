import React, { Component } from 'react';

import wsMgr from '../../js/wsMgr.js';
import colors from '../../js/colors.js';

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
  }

  componentDidMount() {
    const { messages, players } = this.state;

    this.chatSubscription = wsMgr.subscribe("chat", msg => {
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
            <span style={{color: colors.getColor(msg.data.id), fontWeight: "bold"}}>{msg.data.username + ": "}</span>
            <span>{msg.data.text}</span>
          </div>
        );
        this.setState({ messages });
        break;

        case "arrived":
        messages.push(
          <div key={this.msgIds++}>
            <span style={{color: "#a0a0a0", fontWeight: "bold"}}><span style={{color: colors.getColor(msg.data.id)}}>{msg.data.username}</span>{" entered the chat"}</span>
          </div>
        );
        players[msg.data.id] = msg.data;
        this.setState({ messages, players });
        break;

        case "left":
        messages.push(
          <div key={this.msgIds++}>
            <span style={{color: "#a0a0a0", fontWeight: "bold"}}><span style={{color: colors.getColor(msg.data.id)}}>{msg.data.username}</span>{" left the chat"}</span>
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
    this.messageDummy.scrollIntoView({ behavior: "smooth" });
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
        <div key={id} style={{color: colors.getColor(id), fontWeight: "bold"}}>{players[id].username}</div>
      );
    }

    return (
      <div style={{height: "100%"}}>
        <div style={{height: "35%", overflowY: "auto"}}>
          <div style={{fontSize: "150%", fontWeight: "bold"}}>Global chat</div>
          <div style={{textDecoration: "underline", marginTop: "10px"}}>Connected players:</div>
          {playersComp}
        </div>
        <div style={{height: "65%"}}>
          <div style={{display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden"}}>
            <div style={{flexGrow: 1, overflowY: "auto"}}>
              <div style={{borderTop: "1px solid #b8b8b8"}}>
                {messages}
              </div>
              <div ref={el => this.messageDummy = el}></div>
            </div>
            <div style={{textAlign: "center", paddingBottom: "15px", paddingTop: "15px", borderTop: "1px solid lightgray"}}>
              <form onSubmit={this.handleSend}>
                <input type="text" value={text} onChange={this.handleChangeText}></input>
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
