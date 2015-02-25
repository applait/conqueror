# ConQueror

Application layer for ConQ

## Install

- Give write permissions to the `storage` directory.
- Change values in `config.js` if necessary.
- `npm install`
- `npm start`

## API

### Create a session

**`POST` `/api/create`**

#### Data:

- `name`: String. The name to identify the user


#### Response

```json
{
    "message": "Session created",
    "session": {
        "id": session_id,
        "data": {
            "members": [
                {
                    "ip": creator_ip,
                    "name": creator_name,
                    "joined": created_timestamp,
                    "quit": null
                }
            ],
            "meta": {
                "created": created_timestamp,
                "creator": creator_name
            }
        }
    }
}
```

### Connect to a session

**`POST` `/api/connect/:session_id`**

#### Data:

- `name`: String. The name to identify the user


#### Response

```json
{
    "message": "Session joined",
    "session": {
        "id": session_id,
        "data": {
            "members": [
                {
                    "ip": creator_ip,
                    "name": creator_name,
                    "joined": created_timestamp,
                    "quit": null
                },
                {
                    "ip": connector_ip,
                    "name": connector_name,
                    "joined": connected_timestamp,
                    "quit": null
                }
            ],
            "meta": {
                "created": created_timestamp,
                "creator": creator_name
            }
        }
    }
}
```
