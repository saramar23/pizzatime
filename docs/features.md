The bot overview
Project Overview: PizzaTime
PizzaTime is a real-time, interactive web menu designed to transform the static digital ordering experience into a guided conversation. Instead of just scrolling through a list, customers are greeted by an Intelligent Menu Agent that acts as a digital server, providing personalized recommendations and managing order logistics within a seamless chat interface.

Core Features
Interactive Digital Menu: A sleek, category-based interface showcasing Pizzas, Drinks, Desserts, and Craft Beers.

Proactive AI Agent: Upon page load, an embedded agent initiates a conversation. It doesn't just wait for questions—it actively pushes notifications to suggest items based on:

External Context: Weather-appropriate pairings (e.g., refreshing drinks on hot days).

Store Metrics: Daily specials, trending items, or "Most Popular of the Week."

Deep Product Knowledge: The agent acts as a nutrition and value expert, providing instant data on:

Pricing and caloric content.

Portion sizes and "shareability" suggestions.

Dynamic Order Management: The agent tracks the user’s current cart and provides:

Real-time total calculations.

Accurate "Wait Time" estimates based on the current kitchen queue.

Technical Objectives
Context-Aware Logic: Integrating weather APIs and store inventory APIs to power the agent’s recommendation engine.

State Management: Ensuring the agent remains synced with the user’s menu selections and the restaurant’s live order volume.

Conversational UI: A lightweight chat overlay that doesn't obstruct the visual menu but remains easily accessible for customer inquiries.

-------------------------------

A web app menu for customers in a pizza restaurant.

Users will access the app to see the menu, but when they access the page an Agent in the page send a notification in a chat window where they can reply and talk about the menu with the agent.

The menu will have things that the pizza shop offers:
Drinks, Pizza, Dessert, beer, etc.
The agent will:

When user access the page, give the user/client some recommendation base on the weather, special of the day, or most popular of the day or the week.
Agent should know:

Everything in the menu like prices, calories, how many can eat if sharable.

Should know the order, total, how long it will take base on order in the q.

---------------------------------

The tools and framework to build:

FE/BE = Next.js 16 (App router)
DB - Convex
Agent Framework - Mastra
LLM Gateway - OpenRouter
UI - Tailwind + Shadcn
Deployment - Vercel