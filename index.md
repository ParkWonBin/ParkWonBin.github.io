---
#
# By default, content added below the "---" mark will appear in the home page
# between the top bar and the list of recent posts.
# To change the home page layout, edit the _layouts/home.html file.
# See: https://jekyllrb.com/docs/themes/#overriding-theme-defaults
#
layout: home
custom_css: /assets/webapp_card.css
---

<!-- {% include dataPage/webapp_App.html %} -->
{% include dataPage/webapp_Demo.html %}
{% include dataPage/webapp_Proj.html %}
{% include dataPage/webapp_Test.html %}


{%- if site.posts.size > 0 -%}
<h2 class="post-list-heading">{{ page.list_title | default: "Posts" }}</h2>
<ul class="post-list">
    {%- for post in site.posts -%}
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
    {%- endfor -%}
</ul>
{%- endif -%}