import { singleton } from "tsyringe";
import { Connection, ConnectionManager, ConnectionOptions, createConnection, getConnectionManager } from "typeorm"
import { ProvaConstants } from "../common/constants";


/**
 * Database manager class
 */
@singleton()
export class DatabaseManager {
    private connectionManager: ConnectionManager

    constructor() {
        this.connectionManager = getConnectionManager()
    }

    public async getConnection(): Promise<Connection> {
        const CONNECTION_NAME = ProvaConstants.CONNECTION_DEV_DEFAULT_NAME;

        let connection: Connection;

        if (this.connectionManager.has(CONNECTION_NAME)) {
            console.info(`Database.getConnection()-using existing connection ...`);
            connection = this.connectionManager.get(CONNECTION_NAME);

            if (!connection.isConnected) {
                connection = await connection.connect();
            }
        }
        else {
            console.info(`Database.getConnection()-creating new connection ...`);
            const connectionOptions: ConnectionOptions = {
                name: CONNECTION_NAME,
                type: `mysql`,
                port: <any>process.env.MYSQL_PORT | 3306,
                synchronize: false,
                logging: [
                    "query"
                ],
                host: process.env.MYSQL_HOST,
                username: process.env.MYSQL_USER,
                database: process.env.MYSQL_DATABASE,
                password: process.env.MYSQL_PASSWORD,
                entities: [
                    __dirname + '/../**/*.entity.{js,ts}'
                ],
                extra: {
                    connectionLimit: 1
                },
                subscribers: [
                    __dirname + '/../**/AuditEntity.entity.{js,ts}'
                ]
            };
            connection = await createConnection(connectionOptions);
        }

        return connection;
    }
}