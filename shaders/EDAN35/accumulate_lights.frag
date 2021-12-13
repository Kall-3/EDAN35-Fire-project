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

layout (location = 0) out vec4 light_diffuse_contribution;
layout (location = 1) out vec4 light_specular_contribution;


void main()
{
	vec2 texCoords = vec2(gl_FragCoord.x * inverse_screen_resolution.x, gl_FragCoord.y * inverse_screen_resolution.y);

	vec3 normal = normalize(2.0*texture(normal_texture, texCoords).xyz - 1.0);

	float depth = texture(depth_texture, texCoords).x;
	 
	vec4 pos = (camera.view_projection_inverse) * (vec4(vec3(2.0*texCoords-1.0, 2.0*depth-1.0), 1.0));
	pos = pos/pos.w;

	
	vec3 view = normalize((vec4(camera_position, 1.0)).xyz - pos.xyz);
	vec3 light = normalize((vec4(light_position, 1.0)).xyz - pos.xyz);

	float light_falloff = dot(light_position-pos.xyz, light_position-pos.xyz);
	float angle_falloff = max((light_angle_falloff - acos(dot(-light, normalize(light_direction)))), 0.0)/light_angle_falloff;
	
	float total_intensity = light_intensity*angle_falloff/light_falloff;

	vec4 pos_lightCoord = lights[light_index].view_projection * pos;
	pos_lightCoord = pos_lightCoord/pos_lightCoord.w;


	vec2 shadowmap_texel_size = 1.0/vec2(1024,1024);
	float shadowdepth = 0.0;
	for(float i = -2.0; i < 3.0; i++){
		for(float j = -2.0; j < 3.0; j++){
			shadowdepth += texture(shadow_texture, vec3((1.0+vec2(pos_lightCoord.xy))/2.0+vec2(shadowmap_texel_size.x*i, shadowmap_texel_size.y*j), (0.9999+pos_lightCoord.z)/2.0));
		}
	}
	shadowdepth = shadowdepth/25.0;
	//shadowdepth += texture(shadow_texture, vec3((1.0+vec2(pos_ligtCoord.xy))/2.0, (0.9999+pos_ligtCoord.z)/2.0));

	//commence phonging
	light_diffuse_contribution  = vec4((light_color*max(dot(normal,light),0.0))*total_intensity, 1.0);
	light_specular_contribution = vec4(shadowdepth*(light_color*pow(max(dot(normalize(reflect(-light, normal)), view),0.0),100.0))*total_intensity, 1.0);

}
