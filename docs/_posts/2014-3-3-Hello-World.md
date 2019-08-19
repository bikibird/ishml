---
layout: post
title: You're up and running!
categories: [blog, test]
permalink: /blog/test.html
---

Next you can update your site name, avatar and other options using the _config.yml file in the root of your repository (shown below).

![_config.yml]({{ site.baseurl }}/images/config.png)

I’ve just released version 1 of  ISHML.

ISHML stands for Interactive Story grapH Management Library, but call it “Ishmael.” Its intent is to facilitate the creation of interactive fiction in JavaScript and is intended for client-side applications running in modern browsers.

The ISHML library is a fluent API with straightforwardly named properties and methods, many of which are chainable.

Eventually, ISHML will address all aspects of creating interactive fiction. For now, though, ISHML is just a really flexible and powerful recursive descent parser with backtracking, which is capable of returning multiple interpretations of a given input text.

In ISHML, you create a parser by defining a grammar. A grammar is a set of nested rules that describes the syntax tree to be generated during parsing. The structure of the grammar mirrors the structure of the syntax tree. Rules are, in spirit, a JavaScript adaptation of BNF notation.

There are many, many ways to configure the rules.

If you are looking to write Parser IF in JavaScript but don’t want to hand code a parser from scratch, this may be the library you’ve been looking for. I won’t say writing a good grammar is easy. It isn’t. However, it’s definitely easier than writing a parser. There is a lengthy tutorial and API reference here:

https://whitewhalestories.com

PS Its open source.  




