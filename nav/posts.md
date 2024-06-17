---
layout: page
title: Posts
permalink: /posts/
---


{% assign current_path = page.url %}
<ul class="post-list">
{%- for post in site.posts -%}
{% if post.url != current_path and post.url contains current_path %}
<li>
    {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
    <span class="post-meta">{{ post.date | date: date_format }}</span>
    <h3>
    <a class="post-link" href="{{ post.url | relative_url }}">
        {{ post.title | escape }}
    </a>
    </h3>
    {%- if site.show_excerpts -%}
    {{ post.excerpt }}
    {%- endif -%}
</li>
{% endif %}
{%- endfor -%}
</ul>