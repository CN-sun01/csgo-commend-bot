const SteamUser = require("steam-user");
const SteamTotp = require("steam-totp");
const GameCoordinator = require("./GameCoordinator.js");

module.exports = class Account {
	constructor(isTarget = false) {
		this.steamUser = new SteamUser({
			autoRelogin: false,
			enablePicsCache: false,
			picsCacheAll: false
		});
		this.csgoUser = new GameCoordinator(this.steamUser);
		this.loginTimeout = null;
		this.isTarget = isTarget;
	}

	/**
	 * Log into an account
	 * @param {String} username Steam Username
	 * @param {String} password Steam Password
	 * @param {String|undefined} sharedSecret Optional shared secret for 2FA
	 * @param {Number} timeout Timeout before rejecting promise
	 * @returns {Promise.<Object>}
	 */
	login(username, password, sharedSecret = undefined, timeout = 60000) {
		this.username = username;

		return new Promise((resolve, reject) => {
			this.loginTimeout = setTimeout(() => {
				this.steamUser.logOff();
				this.steamUser.removeListener("error", error);
				this.steamUser.removeListener("loggedOn", loggedOn);

				reject(new Error("Failed to log in within given " + timeout + "ms"));
			}, timeout);

			let logonSettings = {
				accountName: username,
				password: password,
				twoFactorCode: (typeof sharedSecret === "string" && sharedSecret.length > 5) ? SteamTotp.getAuthCode(sharedSecret) : undefined
			};

			this.steamUser.logOn(logonSettings);

			let error = (err) => {
				clearTimeout(this.loginTimeout);
				this.loginTimeout = null;

				this.steamUser.removeListener("error", error);
				this.steamUser.removeListener("loggedOn", loggedOn);
				this.steamUser.removeListener("steamGuard", steamGuard);

				reject(err);
			};

			let loggedOn = async () => {
				clearTimeout(this.loginTimeout);
				this.loginTimeout = null;

				await this.steamUser.requestFreeLicense(730);

				this.steamUser.setPersona(SteamUser.EPersonaState.Online);
				this.steamUser.gamesPlayed(730);

				this.steamUser.removeListener("error", error);
				this.steamUser.removeListener("loggedOn", loggedOn);
				this.steamUser.removeListener("steamGuard", steamGuard);

				this.csgoUser.start().then(resolve).catch(reject);
			};

			let steamGuard = () => {
				clearTimeout(this.loginTimeout);
				this.loginTimeout = null;

				this.steamUser.removeListener("error", error);
				this.steamUser.removeListener("loggedOn", loggedOn);
				this.steamUser.removeListener("steamGuard", steamGuard);

				reject(new Error("Steam Guard required"));
			}

			this.steamUser.on("error", error);
			this.steamUser.on("loggedOn", loggedOn);

			if (!this.isTarget) {
				this.steamUser.on("steamGuard", steamGuard);
			}
		});
	}

	/**
	 * Set games played with server ID
	 * @param {String} serverID ServerID
	 * @returns {undefined}
	 */
	setGamesPlayed(serverID) {
		this.steamUser.gamesPlayed({
			game_id: 730,
			steam_id_gs: serverID
		});
	}

	/**
	 * Commend a player
	 * @param {String} serverID ServerID of our target
	 * @param {Number} accountID AccountID of our target
	 * @param {String} matchID Optional MatchID
	 * @param {Boolean|Number} cmd_friendly Do we want to commend as friendly?
	 * @param {Boolean|Number} cmd_teaching Do we want to commend as teaching?
	 * @param {Boolean|Number} cmd_leader Do we want to commend as leader?
	 * @returns {Promise.<Object>}
	 */
	commendPlayer(serverID, accountID, matchID, cmd_friendly, cmd_teaching, cmd_leader) {
		return new Promise(async (resolve, reject) => {
			this.setGamesPlayed(serverID);

			// Wait for the ServerID to set
			await new Promise(p => setTimeout(p, 50));

			this.csgoUser.sendMessage(
				730,
				this.csgoUser.Protos.csgo.ECsgoGCMsg.k_EMsgGCCStrike15_v2_ClientCommendPlayer,
				{},
				this.csgoUser.Protos.csgo.CMsgGCCStrike15_v2_ClientCommendPlayer,
				{
					account_id: accountID,
					match_id: matchID,
					commendation: {
						cmd_friendly: cmd_friendly ? 1 : 0,
						cmd_teaching: cmd_teaching ? 1 : 0,
						cmd_leader: cmd_leader ? 1 : 0
					}
				},
				this.csgoUser.Protos.csgo.ECsgoGCMsg.k_EMsgGCCStrike15_v2_ClientReportResponse,
				this.csgoUser.Protos.csgo.CMsgGCCStrike15_v2_ClientReportResponse,
				20000
			).then(resolve).catch(reject);
		});
	}

	/**
	 * Get the server our target is on
	 * @param {Number} accountid Target account ID
	 * @return {Promise.<Object>}
	 */
	getTargetServer(accountid) {
		return this.csgoUser.sendMessage(
			730,
			this.csgoUser.Protos.csgo.ECsgoGCMsg.k_EMsgGCCStrike15_v2_ClientRequestJoinFriendData,
			{},
			this.csgoUser.Protos.csgo.CMsgGCCStrike15_v2_ClientRequestJoinFriendData,
			{
				account_id: accountid,
				join_token: 837131816,
				join_ipp: 3238322850
			},
			this.csgoUser.Protos.csgo.ECsgoGCMsg.k_EMsgGCCStrike15_v2_ClientRequestJoinFriendData,
			this.csgoUser.Protos.csgo.CMsgGCCStrike15_v2_ClientRequestJoinFriendData,
			10000
		);
	}

	/**
	 * Log out from the account
	 */
	logOff() {
		this.steamUser.logOff();
	}
}
