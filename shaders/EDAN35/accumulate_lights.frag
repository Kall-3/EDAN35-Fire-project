#version 410

struct ViewProjTransforms
{
	mat4 view_projection;
	mat4 view_projection_inverse;
};

layout (std140) uniform CameraViewProjTransforms
{
	ViewProjTransforms camera;
};

layout (std140) uniform LightViewProjTransforms
{
	ViewProjTransforms lights[4];
};

//layout(origin_upper_left) in vec4 gl_FragCoord;

uniform int light_index;

uniform sampler2D depth_texture;
uniform sampler2D normal_texture;
uniform sampler2DShadow shadow_texture;

uniform vec2 inverse_screen_resolution;

uniform vec3 camera_position;

uniform vec3 light_color;
uniform vec3 light_position;
uniform vec3 light_direction;
uniform float light_intensity;
uniform float light_angle_falloff;

uniform vec2 shadowmap_texel_size;

layout (location = 0) out vec4 light_diffuse_contribution;
layout (location = 1) out vec4 light_specular_contribution;


void main()
{
	vec2 texCoords = vec2(gl_FragCoord.x * inverse_screen_resolution.x, gl_FragCoord.y * inverse_screen_resolution.y);
	vec3 normal = normalize(2.0*texture(normal_texture, texCoords).xyz - 1.0);
	
	float depth = texture(depth_texture, texCoords).z;
	vec4 pos = (camera.view_projection_inverse) * vec4(texCoords*depth, gl_FragCoord.z*depth, 1.0);
	pos=pos/pos.w;

	vec3 view = normalize(camera_position - pos.xyz);

	vec3 light = normalize(light_position - pos.xyz);

	//commence phonging
	light_diffuse_contribution  = vec4(light_color*dot(normal,light), 1.0);
	light_specular_contribution = vec4(light_color*dot(reflect(-light, normal), view), 1.0);
}
