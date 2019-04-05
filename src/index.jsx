import React from "react";
import ReactDOM from "react-dom";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import "./css/index.scss";
// Medium-Draft
import { Editor, createEditorState } from "medium-draft";
import "medium-draft/lib/index.css";
// Mobx
import { observer } from "mobx-react";
import { observable, action, computed } from "mobx";
// Rebase
import base from "./rebase";
// My Components
import AddItem from "./todo/AddItem";
import List from "./todo/List";

window.addEventListener("load", () => {
  console.log("Event: Load");

  function updateNetworkStatus() {
    if (navigator.onLine) {
      document.getElementById("status").innerHTML = "Online!";
    } else {
      document.getElementById("status").innerHTML = "Offline";
    }
  }

  setTimeout(() => {
    updateNetworkStatus();
  }, 500);

  window.addEventListener("offline", () => {
    console.log("Event: Offline");
    document.getElementById("status").innerHTML = "Offline";
  });

  window.addEventListener("online", () => {
    console.log("Event: Online");
    document.getElementById("status").innerHTML = "Online!";
  });
});

OfflinePluginRuntime.install({
  onInstalled: () => {
    console.log("SW Event: onInstalled");
  },

  onUpdating: () => {
    console.log("SW Event: onUpdating");
  },

  onUpdateReady: () => {
    console.log("SW Event: onUpdateReady");
    // Tells to new SW to take control immediately
    OfflinePluginRuntime.applyUpdate();
  },

  onUpdated: () => {
    console.log("SW Event: onUpdated");
  }
});

class Store {
  @observable editorState;
}

class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    // create a ref to store the textInput DOM element
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    // Explicitly focus the text input using the raw DOM API
    // Note: we're accessing "current" to get the DOM node
    this.textInput.current.focus();
  }

  render() {
    // tell React that we want to associate the <input> ref
    // with the `textInput` that we created in the constructor
    return (
      <div>
        <input type="text" ref={this.textInput} />

        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}

@observer
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: createEditorState(), // for empty content
      //
      list: [],
      list2: [],
      loading: true
    };

    this.onChange = editorState => {
      console.log(editorState);

      this.setState({ editorState });
    };

    this.refsEditor = React.createRef();
  }

  componentDidMount() {
    this.refsEditor.current.focus();
    //
    this.ref1 = base.syncState("todoList", {
      context: this,
      state: "list",
      asArray: true,
      then() {
        this.setState({ loading: false });
      }
    });
    this.ref2 = base.syncState("todoList2", {
      context: this,
      state: "list2",
      asArray: true,
      then() {
        this.setState({ loading: false });
      }
    });
    this.ref3 = base.syncState("editorStateFB", {
      context: this,
      state: "editorState"
    });
  }

  handleAddItem(newItem) {
    this.setState({
      list: this.state.list.concat([newItem])
    });
    this.setState({
      list2: this.state.list2.concat([newItem])
    });
  }

  handleRemoveItem(index) {
    var newList = this.state.list;
    newList.splice(index, 1);
    this.setState({
      list: newList
    });
    this.setState({
      list2: newList
    });
  }

  componentWillMount() {}

  render() {
    const { editorState } = this.state;
    return (
      <div>
        <Editor
          ref={this.refsEditor}
          editorState={editorState}
          onChange={this.onChange}
        />
        {/** */}
        <div className="container">
          <div className="row">
            <div className="col-sm-6 col-md-offset-3">
              <div className="col-sm-12">
                <h3 className="text-center"> re-base Todo List </h3>
                <AddItem add={this.handleAddItem.bind(this)} />
                {this.state.loading === true ? (
                  <h3> LOADING... </h3>
                ) : (
                  <List
                    items={this.state.list}
                    remove={this.handleRemoveItem.bind(this)}
                  />
                )}
                {this.state.loading === true ? (
                  <h3> LOADING... </h3>
                ) : (
                  <List
                    items={this.state.list2}
                    remove={this.handleRemoveItem.bind(this)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        {/** */}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
