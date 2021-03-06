﻿var NRS = (function(NRS, $, undefined) {
	NRS.blocksPageType = null;
	NRS.tempBlocks = [];

	NRS.getBlock = function(blockID, callback, pageRequest) {
		NRS.sendRequest("getBlock" + (pageRequest ? "+" : ""), {
			"block": blockID
		}, function(response) {
			if (response.errorCode && response.errorCode == -1) {
				NRS.getBlock(blockID, callback, async);
			} else {
				if (callback) {
					response.block = blockID;
					callback(response);
				}
			}
		}, true);
	}

	NRS.handleInitialBlocks = function(response) {
		if (response.errorCode) {
			NRS.dataLoadFinished($("#dashboard_blocks_table"));
			return;
		}

		NRS.blocks.push(response);

		if (NRS.blocks.length < 10 && response.previousBlock) {
			NRS.getBlock(response.previousBlock, NRS.handleInitialBlocks);
		} else {
			NRS.lastBlockHeight = NRS.blocks[0].height;

			//if no new blocks in 24 hours, show blockchain download progress..
			if (NRS.state && NRS.state.time - NRS.blocks[0].timestamp > 60 * 60 * 24) {
				NRS.downloadingBlockchain = true;
				$("#nrs_update_explanation span").hide();
				$("#downloading_blockchain, #nrs_update_explanation_blockchain_sync").show();
				$("#show_console").hide();
				NRS.updateBlockchainDownloadProgress();
			}

			var rows = "";

			for (var i = 0; i < NRS.blocks.length; i++) {
				var block = NRS.blocks[i];

				rows += "<tr><td><a href='#' data-block='" + String(block.height).escapeHTML() + "' data-blockid='" + String(block.block).escapeHTML() + "' class='block'" + (block.numberOfTransactions > 0 ? " style='font-weight:bold'" : "") + ">" + String(block.height).escapeHTML() + "</a></td><td>" + NRS.formatTimestamp(block.timestamp) + "</td><td>" + NRS.formatAmount(block.totalAmountNQT) + " + " + NRS.formatAmount(block.totalFeeNQT) + "</td><td>" + NRS.formatAmount(block.numberOfTransactions) + "</td></tr>";
			}

			$("#dashboard_blocks_table tbody").empty().append(rows);
			NRS.dataLoadFinished($("#dashboard_blocks_table"));
		}
	}

	NRS.handleNewBlocks = function(response) {
		if (NRS.downloadingBlockchain) {
			//new round started...
			if (NRS.tempBlocks.length == 0 && NRS.state.lastBlock != response.block) {
				return;
			}
		}

		//we have all blocks 	
		if (response.height - 1 == NRS.lastBlockHeight || NRS.tempBlocks.length == 99) {
			var newBlocks = [];

			//there was only 1 new block (response)
			if (NRS.tempBlocks.length == 0) {
				//remove oldest block, add newest block
				NRS.blocks.unshift(response);
				newBlocks.push(response);
			} else {
				NRS.tempBlocks.push(response);
				//remove oldest blocks, add newest blocks
				[].unshift.apply(NRS.blocks, NRS.tempBlocks);
				newBlocks = NRS.tempBlocks;
				NRS.tempBlocks = [];
			}

			if (NRS.blocks.length > 100) {
				NRS.blocks = NRS.blocks.slice(0, 100);
			}

			//set new last block height
			NRS.lastBlockHeight = NRS.blocks[0].height;

			NRS.incoming.updateDashboardBlocks(newBlocks);
		} else {
			NRS.tempBlocks.push(response);
			NRS.getBlock(response.previousBlock, NRS.handleNewBlocks);
		}
	}

	//we always update the dashboard page..
	NRS.incoming.updateDashboardBlocks = function(newBlocks) {
		var newBlockCount = newBlocks.length;

		if (newBlockCount > 10) {
			newBlocks = newBlocks.slice(0, 10);
			newBlockCount = newBlocks.length;
		}

		if (NRS.downloadingBlockchain) {
			if (NRS.state && NRS.state.time - NRS.blocks[0].timestamp < 60 * 60 * 24) {
				NRS.downloadingBlockchain = false;
				$("#dashboard_message").hide();
				$("#downloading_blockchain, #nrs_update_explanation_blockchain_sync").hide();
				$("#show_console").show();
				$.growl("The block chain is now up to date.", {
					"type": "success"
				});
				NRS.checkAliasVersions();
			} else {
				NRS.updateBlockchainDownloadProgress();
			}
		}

		var rows = "";

		for (var i = 0; i < newBlockCount; i++) {
			var block = newBlocks[i];

			rows += "<tr><td><a href='#' data-block='" + String(block.height).escapeHTML() + "' data-blockid='" + String(block.block).escapeHTML() + "' class='block'" + (block.numberOfTransactions > 0 ? " style='font-weight:bold'" : "") + ">" + String(block.height).escapeHTML() + "</a></td><td>" + NRS.formatTimestamp(block.timestamp) + "</td><td>" + NRS.formatAmount(block.totalAmountNQT) + " + " + NRS.formatAmount(block.totalFeeNQT) + "</td><td>" + NRS.formatAmount(block.numberOfTransactions) + "</td></tr>";
		}

		if (newBlockCount == 1) {
			$("#dashboard_blocks_table tbody tr:last").remove();
		} else if (newBlockCount == 10) {
			$("#dashboard_blocks_table tbody").empty();
		} else {
			$("#dashboard_blocks_table tbody tr").slice(10 - newBlockCount).remove();
		}

		$("#dashboard_blocks_table tbody").prepend(rows);

		//update number of confirmations... perhaps we should also update it in tne NRS.transactions array
		$("#dashboard_transactions_table tr.confirmed td.confirmations").each(function() {
			if ($(this).data("incoming")) {
				$(this).removeData("incoming");
				return true;
			}

			var confirmations = parseInt($(this).data("confirmations"), 10);

			var nrConfirmations = confirmations + newBlocks.length;

			if (confirmations <= 10) {
				$(this).data("confirmations", nrConfirmations);
				$(this).attr("data-content", NRS.formatAmount(nrConfirmations, false, true) + " confirmations");

				if (nrConfirmations > 10) {
					nrConfirmations = '10+';
				}
				$(this).html(nrConfirmations);
			} else {
				$(this).attr("data-content", NRS.formatAmount(nrConfirmations, false, true) + " confirmations");
			}
		});
	}

	NRS.pages.blocks = function() {
		NRS.pageLoading();

		if (NRS.blocksPageType == "forged_blocks") {
			$("#forged_fees_total_box, #forged_blocks_total_box").show();
			$("#blocks_transactions_per_hour_box, #blocks_generation_time_box").hide();

			NRS.sendRequest("getAccountBlockIds+", {
				"account": NRS.account,
				"timestamp": 0
			}, function(response) {
				if (response.blockIds && response.blockIds.length) {
					var blocks = [];
					var nr_blocks = 0;

					var blockIds = response.blockIds.reverse().slice(0, 100);

					if (response.blockIds.length > 100) {
						$("#blocks_page_forged_warning").show();
					}

					for (var i = 0; i < blockIds.length; i++) {
						NRS.sendRequest("getBlock+", {
							"block": blockIds[i],
							"_extra": {
								"nr": i
							}
						}, function(block, input) {
							if (NRS.currentPage != "blocks") {
								blocks = {};
								return;
							}

							block["block"] = input.block;
							blocks[input["_extra"].nr] = block;
							nr_blocks++;

							if (nr_blocks == blockIds.length) {
								NRS.blocksPageLoaded(blocks);
							}
						});

						if (NRS.currentPage != "blocks") {
							blocks = {};
							return;
						}
					}
				} else {
					NRS.blocksPageLoaded([]);
				}
			});
		} else {
			$("#forged_fees_total_box, #forged_blocks_total_box").hide();
			$("#blocks_transactions_per_hour_box, #blocks_generation_time_box").show();

			if (NRS.blocks.length < 100) {
				if (NRS.downloadingBlockchain) {
					NRS.blocksPageLoaded(NRS.blocks);
				} else {
					if (NRS.blocks && NRS.blocks.length) {
						var previousBlock = NRS.blocks[NRS.blocks.length - 1].previousBlock;
						//if previous block is undefined, dont try add it
						if (typeof previousBlock !== "undefined") {
							NRS.getBlock(previousBlock, NRS.finish100Blocks, true);
						}
					} else {
						NRS.blocksPageLoaded([]);
					}
				}
			} else {
				NRS.blocksPageLoaded(NRS.blocks);
			}
		}
	}

	NRS.incoming.blocks = function() {
		NRS.pages.blocks();
	}

	NRS.finish100Blocks = function(response) {
		NRS.blocks.push(response);
		if (NRS.blocks.length < 100 && typeof response.previousBlock !== "undefined") {
			NRS.getBlock(response.previousBlock, NRS.finish100Blocks, true);
		} else {
			NRS.blocksPageLoaded(NRS.blocks);
		}
	}

	NRS.blocksPageLoaded = function(blocks) {
		var rows = "";
		var totalAmount = new BigInteger("0");
		var totalFees = new BigInteger("0");
		var totalTransactions = 0;

		for (var i = 0; i < blocks.length; i++) {
			var block = blocks[i];

			totalAmount = totalAmount.add(new BigInteger(block.totalAmountNQT));

			totalFees = totalFees.add(new BigInteger(block.totalFeeNQT));

			totalTransactions += block.numberOfTransactions;

			rows += "<tr><td><a href='#' data-block='" + String(block.height).escapeHTML() + "' data-blockid='" + String(block.block).escapeHTML() + "' class='block'" + (block.numberOfTransactions > 0 ? " style='font-weight:bold'" : "") + ">" + String(block.height).escapeHTML() + "</a></td><td>" + NRS.formatTimestamp(block.timestamp) + "</td><td>" + NRS.formatAmount(block.totalAmountNQT) + "</td><td>" + NRS.formatAmount(block.totalFeeNQT) + "</td><td>" + NRS.formatAmount(block.numberOfTransactions) + "</td><td>" + (block.generator != NRS.genesis ? "<a href='#' data-user='" + NRS.getAccountFormatted(block, "generator") + "' class='user_info'>" + NRS.getAccountTitle(block, "generator") + "</a>" : "Genesis") + "</td><td>" + NRS.formatVolume(block.payloadLength) + "</td><td>" + Math.round(block.baseTarget / 153722867 * 100).pad(4) + " %</td></tr>";
		}

		if (blocks.length) {
			var startingTime = blocks[blocks.length - 1].timestamp;
			var endingTime = blocks[0].timestamp;
			var time = endingTime - startingTime;
		} else {
			var startingTime = endingTime = time = 0;
		}

		$("#blocks_table tbody").empty().append(rows);
		NRS.dataLoadFinished($("#blocks_table"));

		if (blocks.length) {
			var averageFee = new Big(totalFees.toString()).div(new Big("100000000")).div(new Big(String(blocks.length))).toFixed(2);
			var averageAmount = new Big(totalAmount.toString()).div(new Big("100000000")).div(new Big(String(blocks.length))).toFixed(2);
		} else {
			var averageFee = 0;
			var averageAmount = 0;
		}

		averageFee = NRS.convertToNQT(averageFee);
		averageAmount = NRS.convertToNQT(averageAmount);

		$("#blocks_average_fee").html(NRS.formatStyledAmount(averageFee)).removeClass("loading_dots");
		$("#blocks_average_amount").html(NRS.formatStyledAmount(averageAmount)).removeClass("loading_dots");

		if (NRS.blocksPageType == "forged_blocks") {
			if (blocks.length == 100) {
				var blockCount = blocks.length + "+";
			} else {
				var blockCount = blocks.length;
			}

			$("#forged_blocks_total").html(blockCount).removeClass("loading_dots");
			$("#forged_fees_total").html(NRS.formatStyledAmount(NRS.accountInfo.forgedBalanceNQT)).removeClass("loading_dots");
		} else {
			if (time == 0) {
				$("#blocks_transactions_per_hour").html("0").removeClass("loading_dots");
			} else {
				$("#blocks_transactions_per_hour").html(Math.round(totalTransactions / (time / 60) * 60)).removeClass("loading_dots");
			}
			$("#blocks_average_generation_time").html(Math.round(time / 100) + "s").removeClass("loading_dots");
		}

		NRS.pageLoaded();
	}

	$("#blocks_page_type .btn").click(function(e) {
		//	$("#blocks_page_type li a").click(function(e) {
		e.preventDefault();

		var type = $.trim($(this).text()).toLowerCase();

		if (type == "forged by you") {
			NRS.blocksPageType = "forged_blocks";
		} else {
			NRS.blocksPageType = "";
		}

		$("#blocks_average_amount, #blocks_average_fee, #blocks_transactions_per_hour, #blocks_average_generation_time, #forged_blocks_total, #forged_fees_total").html("<span>.</span><span>.</span><span>.</span></span>").addClass("loading_dots");
		$("#blocks_table tbody").empty();
		$("#blocks_table").parent().addClass("data-loading").removeClass("data-empty");

		NRS.pages.blocks();
	});

	$("#goto_forged_blocks").click(function(e) {
		e.preventDefault();

		$("#blocks_page_type").find(".btn:last").button("toggle");
		NRS.blocksPageType = "forged_blocks";
		NRS.goToPage("blocks");
	});

	return NRS;
}(NRS || {}, jQuery));