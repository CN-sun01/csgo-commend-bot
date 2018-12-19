# CSGO Commend Bot
This is a simple commend bot written in JavaScript, simply because its the language I am the most familiar with.

# Previews
## Botted account:
![Account Preview](https://i.imgur.com/XCSoUOb.png)

## Console Log:
![Console Preview](https://i.imgur.com/QUStP3O.png)

# Requirements
- [NodeJS](https://nodejs.org/)
- [Some JSON knowledge](https://www.json.org/)

# Installation
1. Download/Clone this repository
2. Put it all in a folder
3. Open a command prompt *inside* the folder
4. Enter `npm install`
5. Rename `config.json.example` to `config.json` and adjust it ([See below](#config))
6. Rename `accounts.json.example` to `accounts.json` and fill it with accounts ([See below](#accounts))
7. Run `node index.js`

# Config
- AccountToCommend:
- - Type: Integer
- - Description: The Account ID of the Steam Account you want to commend bot ([More Details](#account-id))
- CommendsToSend:
- - Type: Integer
- - Description: The amount of commends we want to send to that account
- Commend:
- - Friendly:
- - - Type: Boolean
- - - Description: Do we want to include "Friendly" in the commend?
- - Teacher:
- - - Type: Boolean
- - - Description: Do we want to include "Teacher" in the commend?
- - Leader:
- - - Type: Boolean
- - - Description: Do we want to include "Leader" in the commend?
- AccountCooldown:
- - Type: Integer
- - Description: How long accounts are on cooldown before they can be reused. Currently 12 hours.
- RateLimitedCooldown:
- - Type: Integer
- - Description: The time in milliseconds how long we should wait incase we hit a ratelimit. I recommend ~1 hour.
- Chunks:
- - CommendsPerChunk:
- - - Type: Integer,
- - - Description: How many commends we should send per chunk
- - TimeBetweenChunks:
- - - Type: Integer,
- - - Description: Time in milliseconds how long we should wait between each chunk
- - TimeBetweenConnectionAndSending:
- - - Type: Integer
- - - Description: Time in milliseconds how long we should wait between connecting to the GameCoordinator and sending the Commend
- - BeautifyDelay:
- - - Type: Integer
- - - Description: Time in milliseconds between chunks and logging the message "Waiting X ms" to make it look more beautiful in the logs. Technically irrelevant.

# Accounts
The accounts.json is an array of objects, each object has this structure:
- username:
- - Type: String
- - Description: The username used to log into Steam
- password:
- - Type: String
- - Description: The password used to log into Steam
- sharedSecret:
- - Type: String
- - Description: Optional shared secret for Two Factor Authentication
- operational:
- - Type: Boolean/Integer
- - Description: "true" if the account is usable, otherwise the error code from Steam ([More details](https://github.com/DoctorMcKay/node-steam-user/blob/master/enums/EResult.js))
- lastCommend:
- - Type: Integer
- - Description: The last time this account has commended someone
- requiresSteamGuard:
- - Type: Boolean
- - Description: If true then the account is unusable and requires a Email Steam Guard verification
- commended:
- - Type: Array of Integers
- - Description: A list of each user this account has already commended

# Account ID
In order to get the Account ID use [SteamID.io](https://steamid.io/) copy the `steamID3` and remove everything before the second double point.

Example: `[U:1:22202]` > `22202`
