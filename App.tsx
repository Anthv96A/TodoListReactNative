import React, { useState, useEffect, useCallback } from 'react';
import { v4 } from 'uuid';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Todo, SyncState } from './models/todo-model';
import TodoItem from './components/TodoItem';
import { Database, IDatabase } from './services/database';
import { BoolConverter } from './services/boolConverter';


export default function App() {

  const [value, setValue] = useState('');
  const [todos, setTodos] = useState([]);
  const db: IDatabase = new Database(new BoolConverter());

  useEffect(() => {
      db.getAllTodos().then((allTodos: Todo[]) => {
        setTodos(allTodos);
      });
  }, [])

  const addTodoItemHandler = () => {
      if(value.length > 0){
          const newTodo = {
            id: v4(),
            value: value,
            timeAdded: new Date().toString(),
            syncState: SyncState.Pending,
            checked: false
          } as Todo;
 
          db.addTodo(newTodo).then((td: Todo) => {
            setTodos([...todos, td]);
            setValue('');
          }); 
      }
  }

  const checkTodoHandler = (id: string) => {
      const todo: Todo = todos.find(t => t.id === id);
      const copy = {...todo} as Todo;
      copy.checked = !copy.checked;
      db.updateChecked(copy).then((success: boolean) => {
        if(success){
          setTodos(todos.map((t: Todo)=> {
            if(t.id === id)
              t.checked = !t.checked;
            return t; 
         }));
        }
      });
  };
 
  const deleteTodoHandler = (id: string) => {
      db.deleteTodo(id).then(() => {
        setTodos(todos.filter(todo => {
          if (todo.id !== id)
             return true;
       }) 
      );
    });
  }


  const todoList = todos.map((todo: Todo) => {
     return(
     <TodoItem
      key={todo.timeAdded} 
      text={todo.value} 
      timeAdded={todo.timeAdded}
      checked={todo.checked}
      deleteTodo={() => deleteTodoHandler(todo.id)}
      checkTodo={() => checkTodoHandler(todo.id)}/>
     )
  })

  return (
		<View style={styles.container}>
			<Text style={styles.header}>Todo List</Text>
			<View style={styles.textInputContainer}>
				<TextInput
					style={styles.textInput}
					multiline={true}
					placeholder="What do you want to do today?"
          placeholderTextColor="#abbabb"
          value={value}
          onChangeText={value => setValue(value)}
				/>
        <TouchableOpacity onPress={() => addTodoItemHandler()}>
          <Icon name="plus" size={30} color="green" style={{ marginLeft: 15 }}/>
        </TouchableOpacity>
			</View>

      <ScrollView style={{width: '100%'}}>
        {todoList}
      </ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: '#F5FCFF'
	},
	header: {
		marginTop: '15%',
		fontSize: 20,
		color: 'black',
    paddingBottom: 10,
    textDecorationColor: 'black'
	},
	textInputContainer: {
		flexDirection: 'row',
		alignItems: 'baseline',
		borderColor: 'black',
		borderBottomWidth: 1,
		paddingRight: 10,
		paddingBottom: 10
	},
	textInput: {
		flex: 1,
		height: 20,
		fontSize: 18,
		fontWeight: 'bold',
		color: 'black',
		paddingLeft: 10,
		minHeight: '3%'
	}
});