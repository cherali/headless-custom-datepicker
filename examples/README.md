## NOTE That:
- All examples use `flex-box` for styling and inline-style,but you can repalce it with `grid`, `table` and ...
- Using inline-style is NOT recommended so it's better to replace it with style system that you used for entire app.

#### Remove .txt extension at end of files

for rtl support add the following css

```css
body {
  direction: rtl;
  font-family: __YOUR_FONT__;
}
```
you may need to add this:

```css
* {
  font-family: __YOUR_FONT__;
}
```