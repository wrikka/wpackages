import { describe, it, expect } from "vitest";
import {
	chunkNotifications,
	groupByChannel,
	groupByPriority,
	sortByPriority,
	deduplicateRecipients,
	mergeNotifications,
	calculateBatchStats,
} from "./batch-processor";
import type { Notification } from "../types";

describe("batch-processor", () => {
	const mockNotifications: readonly Notification[] = [
		{
			channel: "email",
			to: "user1@example.com",
			body: "Test 1",
			priority: "high",
		},
		{
			channel: "email",
			to: "user2@example.com",
			body: "Test 2",
			priority: "normal",
		},
		{
			channel: "sms",
			to: "+1234567890",
			body: "Test 3",
			priority: "urgent",
		},
		{
			channel: "push",
			to: "device-token",
			title: "Test",
			body: "Test 4",
			priority: "low",
		},
	];

	describe("chunkNotifications", () => {
		it("should chunk notifications into smaller batches", () => {
			const chunks = chunkNotifications(mockNotifications, 2);
			expect(chunks).toHaveLength(2);
			expect(chunks[0]).toHaveLength(2);
			expect(chunks[1]).toHaveLength(2);
		});

		it("should handle uneven chunks", () => {
			const chunks = chunkNotifications(mockNotifications, 3);
			expect(chunks).toHaveLength(2);
			expect(chunks[0]).toHaveLength(3);
			expect(chunks[1]).toHaveLength(1);
		});
	});

	describe("groupByChannel", () => {
		it("should group notifications by channel", () => {
			const grouped = groupByChannel(mockNotifications);
			expect(grouped.email).toHaveLength(2);
			expect(grouped.sms).toHaveLength(1);
			expect(grouped.push).toHaveLength(1);
		});
	});

	describe("groupByPriority", () => {
		it("should group notifications by priority", () => {
			const grouped = groupByPriority(mockNotifications);
			expect(grouped.urgent).toHaveLength(1);
			expect(grouped.high).toHaveLength(1);
			expect(grouped.normal).toHaveLength(1);
			expect(grouped.low).toHaveLength(1);
		});
	});

	describe("sortByPriority", () => {
		it("should sort notifications by priority", () => {
			const sorted = sortByPriority(mockNotifications);
			expect(sorted[0].priority).toBe("urgent");
			expect(sorted[1].priority).toBe("high");
			expect(sorted[2].priority).toBe("normal");
			expect(sorted[3].priority).toBe("low");
		});
	});

	describe("deduplicateRecipients", () => {
		it("should remove duplicate recipients", () => {
			const duplicates: readonly Notification[] = [
				{
					channel: "email",
					to: ["user@example.com", "user@example.com"],
					body: "Test",
				},
			];
			const result = deduplicateRecipients(duplicates);
			expect(result[0].to).toBe("user@example.com");
		});
	});

	describe("mergeNotifications", () => {
		it("should merge notifications with same recipient and channel", () => {
			const toMerge: readonly Notification[] = [
				{
					channel: "email",
					to: "user@example.com",
					body: "Message 1",
				},
				{
					channel: "email",
					to: "user@example.com",
					body: "Message 2",
				},
			];
			const result = mergeNotifications(toMerge);
			expect(result).toHaveLength(1);
		});
	});

	describe("calculateBatchStats", () => {
		it("should calculate batch statistics", () => {
			const stats = calculateBatchStats(mockNotifications);
			expect(stats.total).toBe(4);
			expect(stats.byChannel.email).toBe(2);
			expect(stats.byChannel.sms).toBe(1);
			expect(stats.byPriority.urgent).toBe(1);
			expect(stats.byPriority.high).toBe(1);
		});
	});
});
