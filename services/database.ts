import { Todo } from '../models/todo-model';
import * as SQLite from 'expo-sqlite'; 
import { WebSQLDatabase } from 'expo-sqlite';
import { IBoolConverter } from './boolConverter';

const database_name: string = 'MyTodoListOffline.db';
const createTable: string = 'CREATE TABLE IF NOT EXISTS Todo (id TEXT PRIMARY KEY NOT NULL, value TEXT, timeAdded TEXT, checked INTEGER, syncState INTEGER)'

export class Database implements IDatabase {

    private readonly boolConverter: IBoolConverter;

    constructor(boolConverter: IBoolConverter) {
        this.boolConverter = boolConverter;
    }

        getAllTodos(): Promise<Todo[]> {
            return new Promise(async(resolve, reject) => {
                try {
                    const todos: Todo[] = [];
                    const db: WebSQLDatabase = await this.initDB();
                    db.transaction((tx: SQLTransaction) => {
                        tx.executeSql('SELECT * FROM Todo', [], (txn: SQLTransaction, results: SQLResultSet ) => {
                            for(let idx = 0; idx < results.rows.length; idx++){
                                const row = results.rows.item(idx);
                                const {id, value, timeAdded, syncState, checked} = row;
                                todos.push({id, value, checked: this.boolConverter.convertToBool(checked), syncState, timeAdded});
                            }
                            resolve(todos);
                        });
                    });
            } catch (error) {
                console.log(error);
                reject(error);
            }  
        }) 
    }

    addTodo(todo: Todo) : Promise<Todo> {
        return new Promise(async (resolve, reject) => {
            try {
                const db: WebSQLDatabase = await this.initDB();
                db.transaction((tx: SQLTransaction) => {
                    const query = 'INSERT INTO Todo(id, value, timeAdded, checked, syncState) VALUES (?, ?, ?, ?, ?)';
                    const args = [todo.id, todo.value, todo.timeAdded, this.boolConverter.convertToInt(todo.checked), todo.syncState];
                    tx.executeSql(query, args, (txn, results) => {
                        resolve(todo);
                    });
                }); 
            } catch (error) {
                console.log(error);
                reject(error); 
            } 
        });
    }

    updateChecked(todo: Todo): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            const db: WebSQLDatabase = await this.initDB();
            db.transaction((tx: SQLTransaction) => {
                const value: number = this.boolConverter.convertToInt(todo.checked); 
                const query = 'UPDATE Todo SET checked = ? WHERE id = ?';
                tx.executeSql(query, [value, todo.id], (tx, result) => {
                    resolve(true);
                }, (tx, err) => false);
            })
        }); 
    }
    deleteTodo(id: string): Promise<void> {
        return new Promise(async(resolve, reject) => {
            const db: WebSQLDatabase = await this.initDB();
            db.transaction((tx: SQLTransaction) => {
                const query = 'DELETE FROM Todo WHERE id = ?';
                tx.executeSql(query, [id], (tx, result) => {
                    resolve();
                }, (tx, err) => false);
            }) 
        }); 
    }

    private initDB(): Promise<WebSQLDatabase> {
        return new Promise((resolve, reject) => {
            try {
                const db = SQLite.openDatabase(database_name);
                db.transaction((tx) => {
                    tx.executeSql(createTable,[]);
                    resolve(db);
                });
                    
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });        
    }
}

export interface IDatabase {
    addTodo(todo: Todo) : Promise<Todo>;
    getAllTodos(): Promise<Todo[]>;
    updateChecked(todo: Todo): Promise<boolean>
    deleteTodo(id: string): Promise<void>
}

