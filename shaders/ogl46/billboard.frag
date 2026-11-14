#version 460 core
#define STAGE_FRAGMENT 1
layout(location = 2) in vec2 f_coord;

#pragma texture(tex1, 0, sRGB_A)
layout(binding = 0) uniform sampler2D tex1;

#include "common.glsl"
#include "tonemapping.glsl"

layout(location = 0) out vec4 out_color;
layout(location = 1) out vec4 out_motion;

// the samples of the point of the lamp its occlusion queries counted (the opengl renderer, with param[1].w 1): the glare is as
// bright as the part of the point which is seen
layout(std430, binding = GLARE_SSBO_BINDING) readonly buffer glare_ssbo
{
	uint glare_seen;
	uint glare_all;
};

void main()
{
	vec4 tex_color = texture(tex1, f_coord);
	if (param[1].w > 0.5f)
	{
		tex_color.a *= (glare_all > 0u ? clamp(float(glare_seen) / float(glare_all), 0.0f, 1.0f) : 0.0f);
	}
	if (POSTFX_ENABLED)
	{
		out_color = tex_color * param[0];
	}
	else
	{
	    out_color = tonemap(tex_color * param[0]);
	}
	if (MOTIONBLUR_ENABLED)
	{
		out_motion = vec4(0.0f);
	}
}
