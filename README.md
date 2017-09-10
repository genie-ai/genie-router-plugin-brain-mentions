# genie-router-plugin-brain-mentions

A genie-router brain selector that selects a brain if its name is mentioned in the first words of an input.

This is a plugin for the [https://github.com/matueranet/genie-router](genie-router)
project. It parses the input and scans the first words for a mentioning of a specific brain
or a configured alias for a brain.

For example you can configure the plugin to recognize your custom _api.ai_ agent with the keyword
**Sam**: _Ask sam what is the current weather._ This will result into the input _what is the current
weather_ to api.ai.

# Configuration

To enable the plugin add the configuration key for the plugin: `brain-mentions`.

## Options

### aliases (object, optional)

An object with alias names for a brain. The property of the object is the alternative name,
the value of the object should be the keyword for the brain. The default value is an empty object.

```json
{
	"aliases": {
		"sam": "api-ai",
		"speak": "echo"
	}
}
```

This configuration allows sentences such as `speak what is currently typed` to be sent to a brain of choice,
instead of the default configured brain.

### partsOfInputToCheck (integer, optional)

The number of words to check at the start of the sentence. Default value is 3

### Full example

Add the configuration to the configuration of _genie-router_,
in the `plugins` attribute.

```
{
  "brain-mentions": {
    "aliases": {
		"sam": "api-ai",
		"speak": "echo"
	},
	"partsOfInputToCheck": 3
  }
}
```
